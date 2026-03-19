export async function updateShopifyPrice(
  accessToken: string,
  shopDomain: string,
  productId: string,
  price: number
): Promise<void> {
  // Fetch existing variants first to update their prices
  const variantsRes = await fetch(
    `https://${shopDomain}/admin/api/2024-01/products/${productId}/variants.json`,
    { headers: { 'X-Shopify-Access-Token': accessToken } }
  )

  if (!variantsRes.ok) {
    throw new Error(`Failed to fetch Shopify variants for product ${productId}: ${await variantsRes.text()}`)
  }

  const { variants } = await variantsRes.json() as { variants: Array<{ id: number }> }

  for (const variant of variants ?? []) {
    const res = await fetch(
      `https://${shopDomain}/admin/api/2024-01/variants/${variant.id}.json`,
      {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variant: { id: variant.id, price: price.toFixed(2) } }),
      }
    )
    if (!res.ok) {
      throw new Error(`Failed to update Shopify variant ${variant.id}: ${await res.text()}`)
    }
  }
}
