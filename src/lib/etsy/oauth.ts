import crypto from 'crypto'

const ETSY_AUTH_URL = 'https://www.etsy.com/oauth/connect'
const ETSY_TOKEN_URL = 'https://api.etsy.com/v3/public/oauth/token'

const SCOPES = ['listings_r', 'listings_w', 'listings_d', 'transactions_r'].join(' ')

export function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(64).toString('base64url').slice(0, 128)
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

export function getEtsyAuthUrl(challenge: string, state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.ETSY_API_KEY!,
    redirect_uri: process.env.ETSY_REDIRECT_URI!,
    scope: SCOPES,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })
  return `${ETSY_AUTH_URL}?${params}`
}

export async function exchangeEtsyCode(
  code: string,
  verifier: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const res = await fetch(ETSY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.ETSY_API_KEY!,
      redirect_uri: process.env.ETSY_REDIRECT_URI!,
      code,
      code_verifier: verifier,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Etsy token exchange failed: ${err}`)
  }

  return res.json()
}

export async function refreshEtsyToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(ETSY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.ETSY_API_KEY!,
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) throw new Error('Etsy token refresh failed')
  return res.json()
}
