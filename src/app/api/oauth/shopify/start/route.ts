import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth', request.url))

  const shop = request.nextUrl.searchParams.get('shop')
  if (!shop) {
    return NextResponse.redirect(new URL('/dashboard?error=shopify_no_shop', request.url))
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'Shopify not configured' }, { status: 503 })
  }

  const state = crypto.randomBytes(16).toString('hex')
  const scopes = 'read_orders,read_products,write_products'
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/shopify/callback`

  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('shopify_oauth_state', state, { httpOnly: true, maxAge: 600, path: '/' })
  response.cookies.set('shopify_shop', shop, { httpOnly: true, maxAge: 600, path: '/' })
  return response
}
