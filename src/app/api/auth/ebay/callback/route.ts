// eBay OAuth callback — registered with eBay as: /api/auth/ebay/callback
// (eBay resolves the RuName to this URL)
import { NextRequest, NextResponse } from 'next/server'
import { exchangeEbayCode } from '@/lib/ebay/oauth'
import { encryptToken } from '@/lib/tokens'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { registerEbayNotifications } from '@/lib/ebay/notifications'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = request.cookies.get('ebay_oauth_state')?.value

  if (!code || state !== storedState) {
    return NextResponse.redirect(new URL('/dashboard?error=ebay_oauth_failed', request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  try {
    const tokens = await exchangeEbayCode(code)

    // Fetch eBay user info
    const isSandbox = process.env.EBAY_SANDBOX === 'true' || process.env.NODE_ENV !== 'production'
    const privilegeUrl = isSandbox
      ? 'https://apiz.sandbox.ebay.com/sell/account/v1/privilege'
      : 'https://apiz.ebay.com/sell/account/v1/privilege'

    let ebayUsername = user.email ?? 'unknown'
    try {
      const meRes = await fetch(privilegeUrl, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (meRes.ok) {
        const meData = await meRes.json()
        ebayUsername = meData?.ebayProgramStatus?.programStatus?.[0]?.ebayUserId ?? ebayUsername
      }
    } catch {
      // Non-fatal: proceed with fallback username
    }

    const service = createServiceClient()
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    await service.from('connections').upsert(
      {
        user_id: user.id,
        platform: 'ebay',
        platform_user_id: ebayUsername,
        platform_username: ebayUsername,
        access_token: encryptToken(tokens.access_token),
        refresh_token: encryptToken(tokens.refresh_token),
        token_expires_at: expiresAt,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,platform' }
    )

    // Register eBay notification preferences (best-effort)
    try {
      await registerEbayNotifications(tokens.access_token, user.id)
    } catch {
      // Non-fatal: sync will fall back to cron polling
    }

    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.delete('ebay_oauth_state')
    return response

  } catch (error) {
    console.error('eBay OAuth callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=ebay_oauth_failed', request.url))
  }
}
