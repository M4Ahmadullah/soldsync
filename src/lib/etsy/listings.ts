export interface EtsyListing {
  id: string
  title: string
}

export async function getEtsyActiveListings(
  accessToken: string,
  shopId: string
): Promise<EtsyListing[]> {
  const results: EtsyListing[] = []
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
      throw new Error(`Failed to fetch Etsy listings: ${err}`)
    }

    const data = await res.json()

    for (const listing of data.results ?? []) {
      results.push({ id: String(listing.listing_id), title: listing.title })
    }

    if (!data.pagination?.next_page) break
    offset += limit
  }

  return results
}
