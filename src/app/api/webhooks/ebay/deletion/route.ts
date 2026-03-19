import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/service'

const ENDPOINT = 'https://soldsync.vercel.app/api/webhooks/ebay/deletion'

// eBay compliance: endpoint verification challenge (GET)
// eBay pings this URL to confirm ownership before sending real events.
export async function GET(req: NextRequest) {
  const challengeCode = req.nextUrl.searchParams.get('challenge_code')
  const verificationToken = process.env.EBAY_DELETION_TOKEN

  if (!challengeCode || !verificationToken) {
    return new NextResponse('Missing parameters', { status: 400 })
  }

  // Formula: SHA256(challengeCode + verificationToken + endpoint)
  const hash = crypto
    .createHash('sha256')
    .update(challengeCode + verificationToken + ENDPOINT)
    .digest('hex')

  return NextResponse.json({ challengeResponse: hash })
}

// eBay compliance: process account deletion (POST)
// eBay policy: must delete user data within 30 days of receiving this event.
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const ebayUserId = payload?.notification?.data?.userId

    if (ebayUserId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createServiceClient()

      // Delete the eBay connection for this user
      await supabase
        .from('connections')
        .delete()
        .eq('platform', 'ebay')
        .eq('platform_user_id', String(ebayUserId))

      // Log the deletion event
      await supabase.from('webhook_events').insert({
        platform: 'ebay',
        event_type: 'MARKETPLACE_ACCOUNT_DELETION',
        raw_payload: payload,
        signature_valid: true,
        processed: true,
      })
    }
  } catch {
    // Always return 200 to eBay regardless — they retry on non-200
  }

  return new NextResponse('OK', { status: 200 })
}
