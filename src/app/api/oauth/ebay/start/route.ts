import { NextResponse } from 'next/server'
import { getEbayAuthUrl } from '@/lib/ebay/oauth'
import crypto from 'crypto'

export async function GET() {
  if (!process.env.EBAY_APP_ID) {
    return NextResponse.json({ error: 'eBay credentials not configured' }, { status: 503 })
  }

  const state = crypto.randomBytes(16).toString('hex')
  const authUrl = getEbayAuthUrl(state)

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('ebay_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600,
    path: '/',
  })

  return response
}
