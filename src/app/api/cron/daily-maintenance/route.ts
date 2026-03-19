import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getValidToken } from '@/lib/tokens'
import { registerShopifyWebhook } from '@/lib/shopify/webhook'
import { registerEtsyWebhook } from '@/lib/etsy/webhook'
import { getShopifyInventory } from '@/lib/shopify/inventory'
import { getEbayInventory } from '@/lib/ebay/inventory'
import { getEtsyInventory } from '@/lib/etsy/inventory'
import { normalizeTitle } from '@/lib/matching'
import { sendWebhookReregistrationAlert, sendLowStockAlert } from '@/lib/email'

// Runs daily at 3am UTC (see vercel.json)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ message: 'Mock mode — skipping cron' })
  }

  const supabase = createServiceClient()
  const results = { watchdog: { checked: 0, errors: 0 }, stock: { users: 0, alerts: 0 } }

  // ── Phase 1: Webhook Watchdog ─────────────────────────────────────────────
  const { data: connections } = await supabase
    .from('connections')
    .select('id, user_id, platform, platform_user_id')
    .eq('is_active', true)
    .in('platform', ['shopify', 'etsy'])

  for (const conn of connections ?? []) {
    try {
      const token = await getValidToken(conn.user_id, conn.platform as 'shopify' | 'etsy')

      if (conn.platform === 'shopify') {
        await registerShopifyWebhook(token, conn.platform_user_id)
      } else if (conn.platform === 'etsy') {
        await registerEtsyWebhook(token, conn.platform_user_id)
      }

      await supabase
        .from('connections')
        .update({ webhook_last_verified_at: new Date().toISOString() })
        .eq('id', conn.id)

      results.watchdog.checked++
    } catch (err) {
      results.watchdog.errors++
      console.error(`[Watchdog] Failed for ${conn.platform} connection ${conn.id}:`, err)

      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', conn.user_id)
        .single()

      if (profile?.email) {
        await sendWebhookReregistrationAlert({
          email: profile.email,
          platform: conn.platform,
          error: err instanceof Error ? err.message : String(err),
        }).catch(() => null)
      }
    }
  }

  // ── Phase 2: Low Stock Alerts ─────────────────────────────────────────────
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, notification_prefs')
    .filter('notification_prefs->email_on_low_stock', 'eq', true)

  const today = new Date().toISOString().slice(0, 10)

  for (const profile of profiles ?? []) {
    try {
      const prefs = profile.notification_prefs as Record<string, unknown> ?? {}
      const threshold = typeof prefs.low_stock_threshold === 'number' ? prefs.low_stock_threshold : 2

      const { data: userConns } = await supabase
        .from('connections')
        .select('platform, platform_user_id, user_id')
        .eq('user_id', profile.id)
        .eq('is_active', true)

      if (!userConns?.length) continue

      // Collect inventory across all platforms
      const allItems: Array<{ platform: string; id: string; title: string; quantity: number }> = []

      for (const conn of userConns) {
        try {
          const token = await getValidToken(conn.user_id, conn.platform as 'shopify' | 'etsy' | 'ebay')
          let items: { id: string; title: string; quantity: number }[] = []

          if (conn.platform === 'shopify') {
            items = await getShopifyInventory(token, conn.platform_user_id)
          } else if (conn.platform === 'ebay') {
            items = await getEbayInventory(token)
          } else if (conn.platform === 'etsy') {
            items = await getEtsyInventory(token, conn.platform_user_id)
          }

          for (const item of items) {
            allItems.push({ platform: conn.platform, ...item })
          }
        } catch (err) {
          console.error(`[StockCheck] Failed to fetch ${conn.platform} inventory for user ${profile.id}:`, err)
        }
      }

      // Find items at or below threshold
      const lowStockItems = allItems.filter((item) => item.quantity <= threshold)

      // Identify items listed on 2+ platforms (by title similarity)
      const alertItems: Array<{ id: string; platform: string; title: string; quantity: number; platformCount: number }> = []

      for (const item of lowStockItems) {
        const normalizedTitle = normalizeTitle(item.title)
        const matchingPlatforms = allItems.filter(
          (other) => normalizeTitle(other.title) === normalizedTitle
        )
        const platformCount = new Set(matchingPlatforms.map((m) => m.platform)).size
        if (platformCount >= 2) {
          alertItems.push({ ...item, platformCount })
        }
      }

      if (alertItems.length === 0) continue

      // Check if already alerted today
      const { data: existingAlerts } = await supabase
        .from('stock_snapshots')
        .select('listing_id')
        .eq('user_id', profile.id)
        .eq('alerted', true)
        .gte('snapshot_at', `${today}T00:00:00Z`)

      const alertedToday = new Set((existingAlerts ?? []).map((a) => a.listing_id))
      const newAlerts = alertItems.filter((item) => !alertedToday.has(item.id))

      if (newAlerts.length > 0 && profile.email) {
        await sendLowStockAlert({
          email: profile.email,
          items: newAlerts.map((i) => ({
            title: i.title,
            quantity: i.quantity,
            platform: i.platform,
            platformCount: i.platformCount,
          })),
        }).catch(() => null)
        results.stock.alerts += newAlerts.length
      }

      // Insert stock snapshots for all low-stock items
      for (const item of alertItems) {
        const isNew = newAlerts.some((n) => n.id === item.id && n.platform === item.platform)
        await supabase.from('stock_snapshots').insert({
          user_id: profile.id,
          platform: item.platform,
          listing_id: item.id,
          listing_title: item.title,
          quantity: item.quantity,
          alerted: isNew,
        })
      }

      results.stock.users++
    } catch (err) {
      console.error(`[StockCheck] Error for user ${profile.id}:`, err)
    }
  }

  return NextResponse.json(results)
}
