const EBAY_API_BASE = process.env.EBAY_SANDBOX === 'true' || process.env.NODE_ENV !== 'production'
  ? 'https://api.sandbox.ebay.com'
  : 'https://api.ebay.com'

export async function updateEbayPrice(
  accessToken: string,
  sku: string,
  price: number
): Promise<void> {
  // Fetch existing inventory item to preserve non-price fields
  const getRes = await fetch(
    `${EBAY_API_BASE}/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!getRes.ok) {
    throw new Error(`Failed to fetch eBay inventory item ${sku}: ${await getRes.text()}`)
  }

  const item = await getRes.json()

  // Update price in offers
  const offersRes = await fetch(
    `${EBAY_API_BASE}/sell/inventory/v1/offer?sku=${encodeURIComponent(sku)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!offersRes.ok) {
    throw new Error(`Failed to fetch eBay offers for ${sku}: ${await offersRes.text()}`)
  }

  const offersData = await offersRes.json()
  const offers: Array<{ offerId: string; pricingSummary: Record<string, unknown> }> = offersData.offers ?? []

  for (const offer of offers) {
    const patchRes = await fetch(
      `${EBAY_API_BASE}/sell/inventory/v1/offer/${offer.offerId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...offer,
          pricingSummary: {
            ...offer.pricingSummary,
            price: { value: price.toFixed(2), currency: 'USD' },
          },
        }),
      }
    )
    if (!patchRes.ok) {
      throw new Error(`Failed to update eBay offer ${offer.offerId}: ${await patchRes.text()}`)
    }
  }

  void item // suppress unused warning
}
