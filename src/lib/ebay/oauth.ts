const IS_SANDBOX = process.env.EBAY_SANDBOX === 'true' || process.env.NODE_ENV !== 'production'
const EBAY_AUTH_URL = IS_SANDBOX
  ? 'https://auth.sandbox.ebay.com/oauth2/authorize'
  : 'https://auth.ebay.com/oauth2/authorize'
const EBAY_TOKEN_URL = IS_SANDBOX
  ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
  : 'https://api.ebay.com/identity/v1/oauth2/token'

const SCOPES = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
  'https://api.ebay.com/oauth/api_scope/sell.account',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
].join(' ')

export function getEbayAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.EBAY_APP_ID!,
    redirect_uri: process.env.EBAY_REDIRECT_URI!,
    response_type: 'code',
    scope: SCOPES,
    state,
  })
  return `${EBAY_AUTH_URL}?${params}`
}

export async function exchangeEbayCode(code: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> {
  const credentials = Buffer.from(
    `${process.env.EBAY_APP_ID}:${process.env.EBAY_CERT_ID}`
  ).toString('base64')

  const res = await fetch(EBAY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.EBAY_REDIRECT_URI!,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`eBay token exchange failed: ${err}`)
  }

  return res.json()
}

export async function refreshEbayToken(refreshToken: string): Promise<{
  access_token: string
  expires_in: number
}> {
  const credentials = Buffer.from(
    `${process.env.EBAY_APP_ID}:${process.env.EBAY_CERT_ID}`
  ).toString('base64')

  const res = await fetch(EBAY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: SCOPES,
    }),
  })

  if (!res.ok) throw new Error('eBay token refresh failed')
  return res.json()
}
