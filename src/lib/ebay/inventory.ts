const EBAY_API_BASE = process.env.EBAY_SANDBOX === 'true' || process.env.NODE_ENV !== 'production'
  ? 'https://api.sandbox.ebay.com'
  : 'https://api.ebay.com'

export async function getEbayInventory(
  accessToken: string
): Promise<{ id: string; title: string; quantity: number }[]> {
  const results: { id: string; title: string; quantity: number }[] = []
  let href = `${EBAY_API_BASE}/sell/inventory/v1/inventory_item?limit=200`

  while (href) {
    const res = await fetch(href, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Failed to fetch eBay inventory: ${err}`)
    }

    const data = await res.json()

    for (const item of data.inventoryItems ?? []) {
      const qty = item.availability?.shipToLocationAvailability?.quantity ?? 0
      if (qty > 0) {
        results.push({ id: item.sku, title: item.product?.title ?? '', quantity: qty })
      }
    }

    href = data.next ?? ''
    if (!href) break
  }

  return results
}
