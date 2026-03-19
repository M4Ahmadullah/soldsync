import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getValidToken } from '@/lib/tokens'
import { getEbayActiveListings } from '@/lib/ebay/listings'
import { getEtsyActiveListings } from '@/lib/etsy/listings'
import { getShopifyActiveListings } from '@/lib/shopify/listings'
import { updateEbayPrice } from '@/lib/ebay/price'
import { updateEtsyPrice } from '@/lib/etsy/price'
import { updateShopifyPrice } from '@/lib/shopify/price'
import { findBestMatch } from '@/lib/matching'
import { sendPriceSyncFailureAlert } from '@/lib/email'

interface PricePayload {
  user_id: string
  source_platform: string
  target_platform: 'etsy' | 'ebay' | 'shopify'
  listing_title: string
  new_price: number
  source_product_id: string
}

async function verifyQStashSignature(request: NextRequest, body: string): Promise<boolean> {
  if (!process.env.QSTASH_CURRENT_SIGNING_KEY) return true
  const signature = request.headers.get('upstash-signature')
  if (!signature) return false
  try {
    const { Receiver } = await import('@upstash/qstash')
    const receiver = new Receiver({
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
    })
    await receiver.verify({ signature, body })
    return true
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const isValid = await verifyQStashSignature(request, body)
  if (!isValid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload: PricePayload = JSON.parse(body)
  const { user_id, source_platform, target_platform, listing_title, new_price } = payload

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[MOCK] Price sync worker:', payload)
    return NextResponse.json({ status: 'mock_success' })
  }

  const supabase = createServiceClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, notification_prefs')
    .eq('id', user_id)
    .single()

  const priceSyncEnabled = (profile?.notification_prefs as Record<string, unknown>)?.price_sync_enabled !== false

  try {
    const token = await getValidToken(user_id, target_platform)

    const { data: conn } = await supabase
      .from('connections')
      .select('platform_user_id')
      .eq('user_id', user_id)
      .eq('platform', target_platform)
      .single()

    if (!conn) throw new Error(`No ${target_platform} connection for user`)

    let candidates: { id: string; title: string }[] = []
    if (target_platform === 'ebay') {
      candidates = await getEbayActiveListings(token)
    } else if (target_platform === 'etsy') {
      candidates = await getEtsyActiveListings(token, conn.platform_user_id)
    } else if (target_platform === 'shopify') {
      candidates = await getShopifyActiveListings(token, conn.platform_user_id)
    }

    const match = findBestMatch(listing_title, candidates, 0.90)

    if (!match) {
      await supabase.from('price_sync_logs').insert({
        user_id,
        source_platform,
        listing_title,
        new_price,
        targets_updated: [],
        status: 'no_match',
        error_message: `No listing on ${target_platform} matched "${listing_title}"`,
      })
      return NextResponse.json({ status: 'no_match' })
    }

    if (target_platform === 'ebay') {
      await updateEbayPrice(token, match.id, new_price)
    } else if (target_platform === 'etsy') {
      await updateEtsyPrice(token, conn.platform_user_id, match.id, new_price)
    } else if (target_platform === 'shopify') {
      await updateShopifyPrice(token, conn.platform_user_id, match.id, new_price)
    }

    await supabase.from('price_sync_logs').insert({
      user_id,
      source_platform,
      listing_title,
      new_price,
      targets_updated: [{ platform: target_platform, listing_id: match.id }],
      status: 'success',
    })

    return NextResponse.json({ status: 'success', updated: match.id })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    await supabase.from('price_sync_logs').insert({
      user_id,
      source_platform,
      listing_title,
      new_price,
      targets_updated: [],
      status: 'failed',
      error_message: errorMessage,
    })

    if (priceSyncEnabled && profile?.email) {
      await sendPriceSyncFailureAlert({
        email: profile.email,
        listingTitle: listing_title,
        sourcePlatform: source_platform,
        targetPlatform: target_platform,
        newPrice: new_price,
        errorMessage,
      }).catch(() => null)
    }

    return NextResponse.json({ status: 'failed', error: errorMessage }, { status: 500 })
  }
}
