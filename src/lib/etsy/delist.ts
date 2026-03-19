export async function delistEtsyItem(
  accessToken: string,
  shopId: string,
  listingId: string
): Promise<void> {
  const res = await fetch(
    `https://openapi.etsy.com/v3/application/shops/${shopId}/listings/${listingId}`,
    {
      method: 'PATCH',
      headers: {
        'x-api-key': process.env.ETSY_API_KEY!,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state: 'inactive' }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Etsy delist failed for listing ${listingId}: ${err}`)
  }
}
