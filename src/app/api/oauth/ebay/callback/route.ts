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

    // Fetch eBay username
    const meRes = await fetch('https://apiz.ebay.com/sell/account/v1/privilege', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const meData = await meRes.json()
    const ebayUsername = meData?.ebayProgramStatus?.programStatus?.[0]?.ebayUserId ?? user.email ?? 'unknown'

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

    // Register eBay notification preferences
    await registerEbayNotifications(tokens.access_token, user.id)

    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.delete('ebay_oauth_state')
    return response

  } catch (error) {
    console.error('eBay OAuth callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=ebay_oauth_failed', request.url))
  }
}
