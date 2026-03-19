import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getValidToken } from '@/lib/tokens'
import { getEbayActiveListings } from '@/lib/ebay/listings'
import { delistEbayItem } from '@/lib/ebay/delist'
import { getEtsyActiveListings } from '@/lib/etsy/listings'
import { delistEtsyItem } from '@/lib/etsy/delist'
import { getShopifyActiveListings } from '@/lib/shopify/listings'
import { delistShopifyProduct } from '@/lib/shopify/delist'
import { findBestMatch } from '@/lib/matching'
import { sendDelistFailureAlert, sendNoMatchAlert } from '@/lib/email'

interface SyncPayload {
  user_id: string
  source_platform: 'etsy' | 'ebay' | 'shopify'
  target_platform: 'etsy' | 'ebay' | 'shopify'
  listing_title: string
  source_listing_id: string
}

interface NotificationPrefs {
  email_on_failure: boolean
  email_on_no_match: boolean
  email_weekly_digest: boolean
}

async function verifyQStashSignature(request: NextRequest, body: string): Promise<boolean> {
  if (!process.env.QSTASH_CURRENT_SIGNING_KEY) return true // Skip in dev

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
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload: SyncPayload = JSON.parse(body)
  const { user_id, source_platform, target_platform, listing_title, source_listing_id } = payload

  const startTime = Date.now()
  const logBase = { user_id, source_platform, target_platform, listing_title, source_listing_id }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[MOCK] Sync worker called:', logBase)
    return NextResponse.json({ status: 'mock_success', listing_title })
  }

  const supabase = createServiceClient()

  // Load user profile once — used for emails and prefs
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, notification_prefs')
    .eq('id', user_id)
    .single()

  const prefs: NotificationPrefs = {
    email_on_failure: true,
    email_on_no_match: false,
    email_weekly_digest: false,
    ...(profile?.notification_prefs as Partial<NotificationPrefs> ?? {}),
  }

  try {
    const targetToken = await getValidToken(user_id, target_platform)

    const { data: targetConn } = await supabase
      .from('connections')
      .select('platform_user_id')
      .eq('user_id', user_id)
      .eq('platform', target_platform)
      .single()

    if (!targetConn) throw new Error(`No ${target_platform} connection found for user`)

    // Fetch active listings on the target platform
    let candidates: { id: string; title: string }[] = []
    if (target_platform === 'ebay') {
      candidates = await getEbayActiveListings(targetToken)
    } else if (target_platform === 'etsy') {
      candidates = await getEtsyActiveListings(targetToken, targetConn.platform_user_id)
    } else if (target_platform === 'shopify') {
      candidates = await getShopifyActiveListings(targetToken, targetConn.platform_user_id)
    }

    // Find best title match (Jaro-Winkler, threshold 0.90)
    const match = findBestMatch(listing_title, candidates, 0.90)

    if (!match) {
      await supabase.from('sync_logs').insert({
        ...logBase,
        status: 'no_match',
        error_message: `No listing on ${target_platform} matched title within 90% threshold: "${listing_title}"`,
        delist_latency_ms: Date.now() - startTime,
      })

      // Notify user if they have no-match alerts enabled
      if (prefs.email_on_no_match && profile?.email) {
        await sendNoMatchAlert({
          email: profile.email,
          listingTitle: listing_title,
          sourcePlatform: source_platform,
          targetPlatform: target_platform,
        }).catch(() => null)
      }

      return NextResponse.json({ status: 'no_match' })
    }

    // Execute delist on target platform
    if (target_platform === 'ebay') {
      await delistEbayItem(targetToken, match.id)
    } else if (target_platform === 'etsy') {
      await delistEtsyItem(targetToken, targetConn.platform_user_id, match.id)
    } else if (target_platform === 'shopify') {
      await delistShopifyProduct(targetToken, targetConn.platform_user_id, match.id)
    }

    await supabase.from('sync_logs').insert({
      ...logBase,
      target_listing_id: match.id,
      status: 'success',
      delist_latency_ms: Date.now() - startTime,
    })

    return NextResponse.json({ status: 'success', delisted: match.id, score: match.score })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    await supabase.from('sync_logs').insert({
      ...logBase,
      status: 'failed',
      error_message: errorMessage,
      delist_latency_ms: Date.now() - startTime,
    })

    // Send failure alert only if user has enabled it (default: true)
    if (prefs.email_on_failure && profile?.email) {
      await sendDelistFailureAlert({
        email: profile.email,
        listingTitle: listing_title,
        sourcePlatform: source_platform,
        targetPlatform: target_platform,
        errorMessage,
      }).catch(() => null)
    }

    // Return 500 so QStash retries (transient errors)
    return NextResponse.json({ status: 'failed', error: errorMessage }, { status: 500 })
  }
}
