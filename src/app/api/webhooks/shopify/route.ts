import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/service'
import { Client as QStashClient } from '@upstash/qstash'

// Verify Shopify HMAC signature
function verifyShopifyHmac(body: string, signature: string): boolean {
  const secret = process.env.SHOPIFY_CLIENT_SECRET
  if (!secret) return false
  const hash = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64')
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const hmac = request.headers.get('x-shopify-hmac-sha256') ?? ''
  const shopDomain = request.headers.get('x-shopify-shop-domain') ?? ''
  const topic = request.headers.get('x-shopify-topic') ?? ''

  if (!verifyShopifyHmac(body, hmac)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Log the raw event
  await supabase.from('webhook_events').insert({
    platform: 'shopify',
    event_type: topic,
    raw_payload: JSON.parse(body),
    signature_valid: true,
    processed: false,
  })

  // Only handle order creation
  if (topic !== 'orders/create') {
    return NextResponse.json({ received: true })
  }

  const payload = JSON.parse(body)

  // Find the user by shop domain
  const { data: conn } = await supabase
    .from('connections')
    .select('user_id')
    .eq('platform', 'shopify')
    .eq('platform_user_id', shopDomain)
    .eq('is_active', true)
    .single()

  if (!conn) return NextResponse.json({ received: true })

  // Queue a sync job for each line item
  const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN! })

  for (const item of payload.line_items ?? []) {
    const title = item.title
    if (!title) continue

    for (const targetPlatform of ['etsy', 'ebay']) {
      await qstash.publishJSON({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/sync/process`,
        body: {
          user_id: conn.user_id,
          source_platform: 'shopify',
          target_platform: targetPlatform,
          listing_title: title,
          source_listing_id: String(item.id ?? ''),
        },
        retries: 3,
      })
    }
  }

  return NextResponse.json({ received: true })
}
