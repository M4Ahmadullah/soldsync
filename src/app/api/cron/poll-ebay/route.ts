import { NextRequest, NextResponse } from 'next/server'
import { Client as QStashClient } from '@upstash/qstash'
import { createServiceClient } from '@/lib/supabase/service'
import { getValidToken } from '@/lib/tokens'

// FALLBACK POLLING — Only used while eBay webhook notifications are pending approval.
// Runs via Vercel Cron every 5 minutes (see vercel.json).
// Remove once eBay production webhook notifications are live.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ message: 'Mock mode — skipping cron' })
  }

  const supabase = createServiceClient()
  const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN! })

  // Get all active eBay connections
  const { data: ebayConnections } = await supabase
    .from('connections')
    .select('user_id, platform_user_id')
    .eq('platform', 'ebay')
    .eq('is_active', true)

  if (!ebayConnections?.length) {
    return NextResponse.json({ polled: 0 })
  }

  const ebayBase = process.env.EBAY_SANDBOX === 'true' || process.env.NODE_ENV !== 'production'
    ? 'https://api.sandbox.ebay.com'
    : 'https://api.ebay.com'

  let polled = 0
  let jobsQueued = 0

  for (const conn of ebayConnections) {
    try {
      const accessToken = await getValidToken(conn.user_id, 'ebay')
      const since = new Date(Date.now() - 6 * 60 * 1000).toISOString() // last 6 minutes

      const ordersRes = await fetch(
        `${ebayBase}/sell/fulfillment/v1/order?filter=creationdate:[${since}..],orderfulfillmentstatus:{NOT_STARTED|IN_PROGRESS}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!ordersRes.ok) continue

      const { orders = [] } = await ordersRes.json()
      if (!orders.length) { polled++; continue }

      // Find all other connected platforms for this user
      const { data: targetConns } = await supabase
        .from('connections')
        .select('platform')
        .eq('user_id', conn.user_id)
        .eq('is_active', true)
        .neq('platform', 'ebay')

      if (!targetConns?.length) { polled++; continue }

      for (const order of orders) {
        for (const lineItem of order.lineItems ?? []) {
          const title = lineItem.title
          if (!title) continue

          for (const target of targetConns) {
            await qstash.publishJSON({
              url: `${process.env.NEXT_PUBLIC_APP_URL}/api/sync/process`,
              body: {
                user_id: conn.user_id,
                source_platform: 'ebay',
                target_platform: target.platform,
                listing_title: title,
                source_listing_id: lineItem.lineItemId ?? '',
              },
              retries: 3,
            })
            jobsQueued++
          }
        }
      }

      polled++
    } catch (err) {
      console.error(`Poll error for user ${conn.user_id}:`, err)
    }
  }

  return NextResponse.json({ polled, jobsQueued, connections: ebayConnections.length })
}
