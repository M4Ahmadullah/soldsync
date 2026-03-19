const EBAY_API_BASE = process.env.EBAY_SANDBOX === 'true' || process.env.NODE_ENV !== 'production'
  ? 'https://api.sandbox.ebay.com'
  : 'https://api.ebay.com'

export async function delistEbayItem(
  accessToken: string,
  sku: string
): Promise<void> {
  const res = await fetch(
    `${EBAY_API_BASE}/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  // 404 means listing already gone — treat as success
  if (!res.ok && res.status !== 404) {
    const err = await res.text()
    throw new Error(`eBay delist failed for SKU "${sku}": ${err}`)
  }
}
