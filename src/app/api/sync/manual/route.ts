import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getValidToken } from '@/lib/tokens'
import { getEbayActiveListings } from '@/lib/ebay/listings'
import { delistEbayItem } from '@/lib/ebay/delist'
import { getEtsyActiveListings } from '@/lib/etsy/listings'
import { delistEtsyItem } from '@/lib/etsy/delist'
import { getShopifyActiveListings } from '@/lib/shopify/listings'
import { delistShopifyProduct } from '@/lib/shopify/delist'
import { findBestMatch } from '@/lib/matching'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { listing_title, target_platforms } = body as {
    listing_title: string
    target_platforms: string[]
  }

  if (!listing_title?.trim() || !Array.isArray(target_platforms) || target_platforms.length === 0) {
    return NextResponse.json({ error: 'listing_title and target_platforms are required' }, { status: 400 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const mockResults = target_platforms.map((p) => ({
      platform: p,
      status: 'success' as const,
      message: '[mock] Delisted successfully',
    }))
    return NextResponse.json({ results: mockResults })
  }

  const service = createServiceClient()

  const results: Array<{ platform: string; status: 'success' | 'no_match' | 'failed'; message: string }> = []

  for (const platform of target_platforms) {
    try {
      const token = await getValidToken(user.id, platform as 'shopify' | 'etsy' | 'ebay')

      const { data: conn } = await service
        .from('connections')
        .select('platform_user_id')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .eq('is_active', true)
        .single()

      if (!conn) {
        results.push({ platform, status: 'failed', message: 'Platform not connected' })
        continue
      }

      let candidates: { id: string; title: string }[] = []
      if (platform === 'ebay') {
        candidates = await getEbayActiveListings(token)
      } else if (platform === 'etsy') {
        candidates = await getEtsyActiveListings(token, conn.platform_user_id)
      } else if (platform === 'shopify') {
        candidates = await getShopifyActiveListings(token, conn.platform_user_id)
      }

      const match = findBestMatch(listing_title.trim(), candidates, 0.90)

      if (!match) {
        results.push({ platform, status: 'no_match', message: 'No matching listing found (< 90% title similarity)' })
        await service.from('sync_logs').insert({
          user_id: user.id,
          source_platform: 'manual',
          target_platform: platform,
          listing_title: listing_title.trim(),
          source_listing_id: 'manual',
          status: 'no_match',
          error_message: `Manual delist: no listing matched "${listing_title.trim()}"`,
          delist_latency_ms: 0,
        })
        continue
      }

      if (platform === 'ebay') {
        await delistEbayItem(token, match.id)
      } else if (platform === 'etsy') {
        await delistEtsyItem(token, conn.platform_user_id, match.id)
      } else if (platform === 'shopify') {
        await delistShopifyProduct(token, conn.platform_user_id, match.id)
      }

      results.push({ platform, status: 'success', message: `Delisted "${match.title}" (score: ${match.score.toFixed(2)})` })
      await service.from('sync_logs').insert({
        user_id: user.id,
        source_platform: 'manual',
        target_platform: platform,
        listing_title: listing_title.trim(),
        source_listing_id: 'manual',
        target_listing_id: match.id,
        status: 'success',
        delist_latency_ms: 0,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.push({ platform, status: 'failed', message: msg })
      await service.from('sync_logs').insert({
        user_id: user.id,
        source_platform: 'manual',
        target_platform: platform,
        listing_title: listing_title.trim(),
        source_listing_id: 'manual',
        status: 'failed',
        error_message: msg,
        delist_latency_ms: 0,
      })
    }
  }

  return NextResponse.json({ results })
}
