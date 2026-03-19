import { NextRequest, NextResponse } from 'next/server'
import { Client as QStashClient } from '@upstash/qstash'
import { createServiceClient } from '@/lib/supabase/service'
import crypto from 'crypto'

function verifyEtsySignature(rawBody: string, signature: string, timestamp: string): boolean {
  try {
    const message = rawBody + timestamp
    const expected = crypto
      .createHmac('sha256', process.env.ETSY_SHARED_SECRET!)
      .update(message)
      .digest('base64')
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-etsy-signature') ?? ''
  const timestamp = request.headers.get('x-etsy-delivery-timestamp') ?? ''

  const skipVerification = !process.env.ETSY_SHARED_SECRET
  const isValid = skipVerification || verifyEtsySignature(rawBody, signature, timestamp)

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createServiceClient()
    await supabase.from('webhook_events').insert({
      platform: 'etsy',
      event_type: payload.event_type,
      raw_payload: payload,
      signature_valid: isValid,
    })
  }

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (payload.event_type !== 'receipt.created') {
    return NextResponse.json({ received: true })
  }

  const data = payload.data as Record<string, unknown>
  const shopId = String(data?.shop_id ?? '')
  const transactions = (data?.transactions as Array<Record<string, unknown>>) ?? []
  const listingTitle = String(transactions[0]?.title ?? '')
  const listingId = String(transactions[0]?.listing_id ?? '')

  if (!shopId || !listingTitle) {
    return NextResponse.json({ error: 'Missing shop_id or title' }, { status: 400 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[MOCK] Etsy webhook received:', { shopId, listingTitle })
    return NextResponse.json({ received: true })
  }

  const supabase = createServiceClient()

  // Find the selling user via their Etsy connection
  const { data: connection } = await supabase
    .from('connections')
    .select('user_id')
    .eq('platform', 'etsy')
    .eq('platform_user_id', shopId)
    .single()

  if (!connection) {
    return NextResponse.json({ error: 'Unknown shop' }, { status: 404 })
  }

  // Find all OTHER active connections for this user (the target platforms)
  const { data: targetConns } = await supabase
    .from('connections')
    .select('platform')
    .eq('user_id', connection.user_id)
    .eq('is_active', true)
    .neq('platform', 'etsy')

  if (!targetConns?.length) return NextResponse.json({ received: true })

  const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN! })

  for (const target of targetConns) {
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/sync/process`,
      body: {
        user_id: connection.user_id,
        source_platform: 'etsy',
        target_platform: target.platform,
        listing_title: listingTitle,
        source_listing_id: listingId,
      },
      retries: 3,
    })
  }

  return NextResponse.json({ received: true })
}
