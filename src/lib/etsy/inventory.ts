export async function getEtsyInventory(
  accessToken: string,
  shopId: string
): Promise<{ id: string; title: string; quantity: number }[]> {
  const results: { id: string; title: string; quantity: number }[] = []
  let offset = 0
  const limit = 100

  while (true) {
    const res = await fetch(
      `https://openapi.etsy.com/v3/application/shops/${shopId}/listings/active?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'x-api-key': process.env.ETSY_API_KEY!,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Failed to fetch Etsy inventory: ${err}`)
    }

    const data = await res.json()

    for (const listing of data.results ?? []) {
      const qty = listing.quantity ?? 0
      if (qty > 0) {
        results.push({ id: String(listing.listing_id), title: listing.title, quantity: qty })
      }
    }

    if (!data.pagination?.next_page) break
    offset += limit
  }

  return results
}
