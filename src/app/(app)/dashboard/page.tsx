import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/DashboardClient'
import type { SyncLog } from '@/components/SyncLogTable'
import type { PriceSyncLogEntry } from '@/components/PriceSyncLog'
import type { StockSnapshot } from '@/components/StockAlertsPanel'

export interface DailyCount { date: string; success: number; failed: number }

interface Connection {
  id: string
  platform: string
  platform_username?: string | null
  is_active: boolean
  last_webhook_at?: string | null
}

async function getData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const today      = new Date().toISOString().slice(0, 10)
  const sevenAgo   = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [
    { data: connections },
    { data: logs },
    { data: weekLogs },
    { count: monthlyCount },
    { data: priceLogs },
    { data: stockSnapshots },
    { data: profile },
  ] = await Promise.all([
    supabase.from('connections').select('id, platform, platform_username, is_active, last_webhook_at').eq('user_id', user.id),
    supabase.from('sync_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(200),
    supabase.from('sync_logs').select('created_at, status').eq('user_id', user.id).gte('created_at', sevenAgo),
    supabase.from('sync_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', monthStart),
    supabase.from('price_sync_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    supabase.from('stock_snapshots').select('*').eq('user_id', user.id).gte('snapshot_at', `${today}T00:00:00Z`).order('quantity', { ascending: true }),
    supabase.from('profiles').select('notification_prefs, email, subscription_status').eq('id', user.id).single(),
  ])

  // Build 7-day daily breakdown
  const dailyMap: Record<string, DailyCount> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    dailyMap[key] = { date: key, success: 0, failed: 0 }
  }
  for (const log of weekLogs ?? []) {
    const key = (log.created_at as string).slice(0, 10)
    if (dailyMap[key]) {
      if (log.status === 'success') dailyMap[key].success++
      else dailyMap[key].failed++
    }
  }
  const dailySyncs = Object.values(dailyMap)

  const allLogs     = (logs ?? []) as SyncLog[]
  const successCount = allLogs.filter((l) => l.status === 'success').length
  const successRate  = allLogs.length > 0 ? Math.round((successCount / allLogs.length) * 1000) / 10 : 0
  const avgLatency   = allLogs.length > 0 ? Math.round(allLogs.reduce((s, l) => s + (l.delist_latency_ms ?? 0), 0) / allLogs.length) : 0

  const prefs            = (profile?.notification_prefs as Record<string, unknown>) ?? {}
  const lowStockThreshold = typeof prefs.low_stock_threshold === 'number' ? prefs.low_stock_threshold : 2

  // Infer plan limits from subscription_status + price_id env vars
  const status = profile?.subscription_status ?? 'inactive'

  return {
    userId: user.id,
    userEmail: profile?.email ?? user.email ?? '',
    subscriptionStatus: status as string,
    initialConnections: (connections ?? []) as Connection[],
    initialLogs: allLogs,
    dailySyncs,
    monthlyCount: monthlyCount ?? 0,
    priceSyncLogs: (priceLogs ?? []) as PriceSyncLogEntry[],
    stockSnapshots: (stockSnapshots ?? []) as StockSnapshot[],
    lowStockThreshold,
    stats: { totalSyncs: allLogs.length, successRate, avgLatencyMs: avgLatency, doublesSaved: successCount },
  }
}

export default async function DashboardPage() {
  const data = await getData()
  return <DashboardClient {...data} />
}
