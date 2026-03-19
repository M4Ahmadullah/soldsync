interface ShopifyProduct {
  id: number
  title: string
  status: string
}

export async function getShopifyActiveListings(
  accessToken: string,
  shopDomain: string
): Promise<{ id: string; title: string }[]> {
  const res = await fetch(
    `https://${shopDomain}/admin/api/2024-01/products.json?status=active&limit=250`,
    { headers: { 'X-Shopify-Access-Token': accessToken } }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shopify products fetch failed for ${shopDomain}: ${err}`)
  }

  const { products } = await res.json() as { products: ShopifyProduct[] }
  return (products ?? []).map((p) => ({ id: String(p.id), title: p.title }))
}
