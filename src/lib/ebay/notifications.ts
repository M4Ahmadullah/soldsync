import crypto from 'crypto'

export async function registerEbayNotifications(
  accessToken: string,
  userId: string
): Promise<void> {
  const verificationToken = crypto.randomBytes(32).toString('hex')
  const endpoint = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/ebay`

  const isSandbox = process.env.EBAY_SANDBOX === 'true' || process.env.NODE_ENV !== 'production'
  const notifBase = isSandbox ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com'
  const res = await fetch(
    `${notifBase}/commerce/notification/v1/subscription`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topicId: 'MARKETPLACE_ACCOUNT_DELETION',
        deliveryConfig: { endpoint, verificationToken },
      }),
    }
  )

  if (!res.ok) {
    console.error('eBay notification registration failed:', await res.text())
    return
  }

  // Store verification token so the webhook handler can use it
  const { createServiceClient } = await import('../supabase/service')
  const supabase = createServiceClient()
  await supabase
    .from('connections')
    .update({ webhook_id: verificationToken, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('platform', 'ebay')
}
