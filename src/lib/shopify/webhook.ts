/**
 * Registers an orders/create webhook with Shopify Admin API.
 * Called automatically after OAuth so all new orders trigger sync.
 */
export async function registerShopifyWebhook(
  accessToken: string,
  shopDomain: string
): Promise<string> {
  const res = await fetch(
    `https://${shopDomain}/admin/api/2024-01/webhooks.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhook: {
          topic: 'orders/create',
          address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify`,
          format: 'json',
        },
      }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    // 422 means webhook already registered — treat as success
    if (res.status === 422) {
      console.log(`[Shopify] Webhook already registered for ${shopDomain}`)
      return 'already_registered'
    }
    throw new Error(`Shopify webhook registration failed for ${shopDomain}: ${body}`)
  }

  const data = await res.json()
  return String(data.webhook?.id ?? '')
}
