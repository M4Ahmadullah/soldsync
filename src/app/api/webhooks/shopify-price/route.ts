import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/service'
import { Client as QStashClient } from '@upstash/qstash'

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

  if (topic !== 'products/update') {
    return NextResponse.json({ received: true })
  }

  const payload = JSON.parse(body) as {
    id: number
    title: string
    variants?: Array<{ price: string }>
  }

  const newPrice = parseFloat(payload.variants?.[0]?.price ?? '0')
  if (!newPrice || !payload.title) {
    return NextResponse.json({ received: true })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[MOCK] Shopify price webhook:', { shopDomain, title: payload.title, newPrice })
    return NextResponse.json({ received: true })
  }

  const supabase = createServiceClient()

  const { data: conn } = await supabase
    .from('connections')
    .select('user_id')
    .eq('platform', 'shopify')
    .eq('platform_user_id', shopDomain)
    .eq('is_active', true)
    .single()

  if (!conn) return NextResponse.json({ received: true })

  const { data: targetConns } = await supabase
    .from('connections')
    .select('platform')
    .eq('user_id', conn.user_id)
    .eq('is_active', true)
    .neq('platform', 'shopify')

  if (!targetConns?.length) return NextResponse.json({ received: true })

  const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN! })

  for (const target of targetConns) {
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/sync/price`,
      body: {
        user_id: conn.user_id,
        source_platform: 'shopify',
        target_platform: target.platform,
        listing_title: payload.title,
        new_price: newPrice,
        source_product_id: String(payload.id),
      },
      retries: 3,
    })
  }

  return NextResponse.json({ received: true })
}
