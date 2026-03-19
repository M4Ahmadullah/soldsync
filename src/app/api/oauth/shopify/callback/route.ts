import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { encryptToken } from '@/lib/tokens'
import { registerShopifyWebhook, registerShopifyProductsWebhook } from '@/lib/shopify/webhook'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const shop = searchParams.get('shop') ?? request.cookies.get('shopify_shop')?.value
  const storedState = request.cookies.get('shopify_oauth_state')?.value

  if (!code || state !== storedState || !shop) {
    return NextResponse.redirect(new URL('/dashboard?error=shopify_oauth_failed', request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth', request.url))

  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code,
      }),
    })

    if (!tokenRes.ok) throw new Error('Shopify token exchange failed')
    const { access_token } = await tokenRes.json()

    // Fetch shop info
    const shopRes = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
      headers: { 'X-Shopify-Access-Token': access_token },
    })
    const shopData = shopRes.ok ? await shopRes.json() : {}
    const shopName = shopData.shop?.name ?? shop

    const service = createServiceClient()
    await service.from('connections').upsert(
      {
        user_id: user.id,
        platform: 'shopify',
        platform_user_id: shop,          // store domain (e.g. store.myshopify.com) for API calls
        platform_username: shopName,     // human-readable store name
        access_token: encryptToken(access_token),
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,platform' }
    )

    // Register orders/create webhook so Shopify POSTs to us on every sale
    const webhookId = await registerShopifyWebhook(access_token, shop)
    await service
      .from('connections')
      .update({ webhook_id: webhookId, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('platform', 'shopify')

    // Register products/update webhook for price sync
    await registerShopifyProductsWebhook(access_token, shop).catch((err) => {
      console.error('[Shopify] Failed to register products/update webhook:', err)
    })

    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.delete('shopify_oauth_state')
    response.cookies.delete('shopify_shop')
    return response

  } catch (error) {
    console.error('Shopify OAuth callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=shopify_oauth_failed', request.url))
  }
}
