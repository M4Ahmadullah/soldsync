export async function delistShopifyProduct(
  accessToken: string,
  shopDomain: string,
  productId: string
): Promise<void> {
  const res = await fetch(
    `https://${shopDomain}/admin/api/2024-01/products/${productId}.json`,
    {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product: { id: Number(productId), status: 'draft' } }),
    }
  )

  if (!res.ok && res.status !== 404) {
    const err = await res.text()
    throw new Error(`Shopify delist failed for product ${productId} on ${shopDomain}: ${err}`)
  }
}
