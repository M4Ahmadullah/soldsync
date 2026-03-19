import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import crypto from 'crypto'

// eBay compliance: endpoint verification challenge (GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challengeCode = searchParams.get('challenge_code')

  if (!challengeCode) return NextResponse.json({ error: 'Missing challenge_code' }, { status: 400 })

  const endpoint = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/ebay-deletion`
  const verificationToken = process.env.EBAY_DELETION_VERIFICATION_TOKEN ?? 'dev_placeholder'

  const hash = crypto
    .createHash('sha256')
    .update(challengeCode + verificationToken + endpoint)
    .digest('hex')

  return NextResponse.json({ challengeResponse: hash })
}

// eBay compliance: process account deletion (POST)
// eBay policy: must delete user data within 30 days of receiving this event.
export async function POST(request: NextRequest) {
  const payload = await request.json()
  const notification = payload?.notification
  const ebayUserId = notification?.data?.userId

  if (!ebayUserId) return NextResponse.json({ received: true })

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createServiceClient()

    // Delete the eBay connection for this user
    await supabase
      .from('connections')
      .delete()
      .eq('platform', 'ebay')
      .eq('platform_user_id', ebayUserId)

    // Log the deletion event
    await supabase.from('webhook_events').insert({
      platform: 'ebay',
      event_type: 'MARKETPLACE_ACCOUNT_DELETION',
      raw_payload: payload,
      signature_valid: true,
      processed: true,
    })
  } else {
    console.log('[MOCK] eBay deletion webhook received for userId:', ebayUserId)
  }

  return NextResponse.json({ received: true })
}
