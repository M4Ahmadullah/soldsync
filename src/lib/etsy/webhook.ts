export async function registerEtsyWebhook(
  accessToken: string,
  shopId: string
): Promise<string> {
  const res = await fetch(
    `https://openapi.etsy.com/v3/application/shops/${shopId}/receipts/webhooks`,
    {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ETSY_API_KEY!,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/etsy`,
        event_type: 'receipt.created',
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Etsy webhook registration failed: ${err}`)
  }

  const data = await res.json()
  return String(data.webhook_id)
}
