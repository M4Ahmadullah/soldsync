interface ShopifyProduct {
  id: number
  title: string
  variants: Array<{ inventory_quantity: number }>
}

export async function getShopifyInventory(
  accessToken: string,
  shopDomain: string
): Promise<{ id: string; title: string; quantity: number }[]> {
  const res = await fetch(
    `https://${shopDomain}/admin/api/2024-01/products.json?status=active&limit=250`,
    { headers: { 'X-Shopify-Access-Token': accessToken } }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shopify inventory fetch failed for ${shopDomain}: ${err}`)
  }

  const { products } = await res.json() as { products: ShopifyProduct[] }
  return (products ?? []).map((p) => ({
    id: String(p.id),
    title: p.title,
    quantity: p.variants?.reduce((sum, v) => sum + (v.inventory_quantity ?? 0), 0) ?? 0,
  })).filter((p) => p.quantity > 0)
}
