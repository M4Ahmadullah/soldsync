import { NextRequest, NextResponse } from 'next/server'
import { Client as QStashClient } from '@upstash/qstash'
import { createServiceClient } from '@/lib/supabase/service'
import crypto from 'crypto'

// eBay challenge handshake (GET) — required before real events are sent
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challengeCode = searchParams.get('challenge_code')

  if (!challengeCode) return NextResponse.json({}, { status: 400 })

  const endpoint = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/ebay`
  const verificationToken = process.env.EBAY_VERIFICATION_TOKEN ?? 'dev_placeholder'

  const hash = crypto
    .createHash('sha256')
    .update(challengeCode + verificationToken + endpoint)
    .digest('hex')

  return NextResponse.json({ challengeResponse: hash })
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createServiceClient()
    await supabase.from('webhook_events').insert({
      platform: 'ebay',
      event_type: (payload.metadata as Record<string, unknown>)?.topic ?? 'unknown',
      raw_payload: payload,
      signature_valid: true,
    })
  }

  const notification = payload.notification as Record<string, unknown> | undefined
  if (!notification) return NextResponse.json({ received: true })

  const data = notification.data as Record<string, unknown> | undefined
  const seller = data?.seller as Record<string, unknown> | undefined
  const item = data?.item as Record<string, unknown> | undefined

  const ebayUserId = String(seller?.username ?? '')
  const itemTitle = String(item?.title ?? '')
  const itemId = String(item?.itemId ?? '')

  if (!ebayUserId || !itemTitle) return NextResponse.json({ received: true })

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[MOCK] eBay webhook received:', { ebayUserId, itemTitle })
    return NextResponse.json({ received: true })
  }

  const supabase = createServiceClient()

  // Find the selling user via their eBay connection
  const { data: connection } = await supabase
    .from('connections')
    .select('user_id')
    .eq('platform', 'ebay')
    .eq('platform_user_id', ebayUserId)
    .single()

  if (!connection) return NextResponse.json({ received: true })

  // Find all OTHER active connections for this user (the target platforms)
  const { data: targetConns } = await supabase
    .from('connections')
    .select('platform')
    .eq('user_id', connection.user_id)
    .eq('is_active', true)
    .neq('platform', 'ebay')

  if (!targetConns?.length) return NextResponse.json({ received: true })

  const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN! })

  for (const target of targetConns) {
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/sync/process`,
      body: {
        user_id: connection.user_id,
        source_platform: 'ebay',
        target_platform: target.platform,
        listing_title: itemTitle,
        source_listing_id: itemId,
      },
      retries: 3,
    })
  }

  return NextResponse.json({ received: true })
}
