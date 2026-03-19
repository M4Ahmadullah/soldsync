import { NextRequest, NextResponse } from 'next/server'
import { exchangeEtsyCode } from '@/lib/etsy/oauth'
import { encryptToken } from '@/lib/tokens'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { registerEtsyWebhook } from '@/lib/etsy/webhook'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = request.cookies.get('etsy_oauth_state')?.value
  const verifier = request.cookies.get('etsy_pkce_verifier')?.value

  if (!code || state !== storedState || !verifier) {
    return NextResponse.redirect(new URL('/dashboard?error=etsy_oauth_failed', request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/auth', request.url))

  try {
    const tokens = await exchangeEtsyCode(code, verifier)

    // Fetch Etsy shop info
    const shopRes = await fetch('https://openapi.etsy.com/v3/application/users/me', {
      headers: {
        'x-api-key': process.env.ETSY_API_KEY!,
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })
    const shopData = await shopRes.json()
    const shopId = String(shopData.shop_id ?? '')
    const shopName = shopData.shop_name ?? 'My Etsy Shop'

    const service = createServiceClient()
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    await service.from('connections').upsert(
      {
        user_id: user.id,
        platform: 'etsy',
        platform_user_id: shopId,
        platform_username: shopName,
        access_token: encryptToken(tokens.access_token),
        refresh_token: encryptToken(tokens.refresh_token),
        token_expires_at: expiresAt,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,platform' }
    )

    // Register webhook for this shop
    const webhookId = await registerEtsyWebhook(tokens.access_token, shopId)
    await service
      .from('connections')
      .update({ webhook_id: webhookId, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('platform', 'etsy')

    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.delete('etsy_pkce_verifier')
    response.cookies.delete('etsy_oauth_state')
    return response

  } catch (error) {
    console.error('Etsy OAuth callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=etsy_oauth_failed', request.url))
  }
}
