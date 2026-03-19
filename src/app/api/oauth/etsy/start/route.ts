import { NextResponse } from 'next/server'
import { generatePKCE, getEtsyAuthUrl } from '@/lib/etsy/oauth'
import crypto from 'crypto'

export async function GET() {
  if (!process.env.ETSY_API_KEY) {
    return NextResponse.json({ error: 'Etsy credentials not configured' }, { status: 503 })
  }

  const { verifier, challenge } = generatePKCE()
  const state = crypto.randomBytes(16).toString('hex')
  const authUrl = getEtsyAuthUrl(challenge, state)

  const response = NextResponse.redirect(authUrl)
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600,
    path: '/',
  }
  response.cookies.set('etsy_pkce_verifier', verifier, cookieOpts)
  response.cookies.set('etsy_oauth_state', state, cookieOpts)

  return response
}
