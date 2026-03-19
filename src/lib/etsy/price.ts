export async function updateEtsyPrice(
  accessToken: string,
  shopId: string,
  listingId: string,
  price: number
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
      body: JSON.stringify({ price: price * 100 }), // Etsy uses cents (integer)
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to update Etsy listing ${listingId} price: ${await res.text()}`)
  }
}
