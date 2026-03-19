import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const hex = process.env.SUPABASE_TOKEN_ENCRYPTION_KEY
  if (!hex) throw new Error('SUPABASE_TOKEN_ENCRYPTION_KEY is not set')
  return Buffer.from(hex, 'hex')
}

export function encryptToken(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptToken(ciphertext: string): string {
  const key = getKey()
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
}

/**
 * Retrieves a valid (auto-refreshed if needed) access token for a platform.
 * Stubs out to a mock token when env keys are missing.
 */
export async function getValidToken(
  userId: string,
  platform: 'ebay' | 'etsy' | 'shopify'
): Promise<string> {
  // ── MOCK: remove this block once Supabase SERVICE_ROLE_KEY is set ──
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return `mock_access_token_${platform}_${userId}`
  }
  // ── END MOCK ────────────────────────────────────────────────────────

  const { createServiceClient } = await import('./supabase/service')
  const supabase = createServiceClient()

  const { data: conn, error } = await supabase
    .from('connections')
    .select('access_token, refresh_token, token_expires_at')
    .eq('user_id', userId)
    .eq('platform', platform)
    .single()

  if (error || !conn) throw new Error(`No ${platform} connection for user ${userId}`)

  const expiresAt = new Date(conn.token_expires_at)
  const bufferMs = 5 * 60 * 1000

  if (expiresAt.getTime() - Date.now() > bufferMs) {
    return decryptToken(conn.access_token)
  }

  // Shopify tokens are permanent — never need refreshing
  if (platform === 'shopify') {
    return decryptToken(conn.access_token)
  }

  // Token is expiring — refresh
  const refreshToken = decryptToken(conn.refresh_token)

  if (platform === 'ebay') {
    const { refreshEbayToken } = await import('./ebay/oauth')
    const result = await refreshEbayToken(refreshToken)
    const newExpiresAt = new Date(Date.now() + result.expires_in * 1000).toISOString()
    await supabase
      .from('connections')
      .update({ access_token: encryptToken(result.access_token), token_expires_at: newExpiresAt })
      .eq('user_id', userId)
      .eq('platform', 'ebay')
    return result.access_token
  } else {
    const { refreshEtsyToken } = await import('./etsy/oauth')
    const result = await refreshEtsyToken(refreshToken)
    const newExpiresAt = new Date(Date.now() + result.expires_in * 1000).toISOString()
    await supabase
      .from('connections')
      .update({ access_token: encryptToken(result.access_token), token_expires_at: newExpiresAt })
      .eq('user_id', userId)
      .eq('platform', 'etsy')
    return result.access_token
  }
}
