import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/DashboardClient'
import type { SyncLog } from '@/components/SyncLogTable'

interface Connection {
  id: string
  platform: string
  platform_username?: string | null
  is_active: boolean
}

async function getData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: connections }, { data: logs }] = await Promise.all([
    supabase.from('connections').select('*').eq('user_id', user.id),
    supabase.from('sync_logs').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(50),
  ])

  const allLogs = (logs ?? []) as SyncLog[]
  const successCount = allLogs.filter((l) => l.status === 'success').length
  const successRate = allLogs.length > 0
    ? Math.round((successCount / allLogs.length) * 1000) / 10
    : 0
  const avgLatency = allLogs.length > 0
    ? Math.round(allLogs.reduce((s, l) => s + (l.delist_latency_ms ?? 0), 0) / allLogs.length)
    : 0

  return {
    userId: user.id,
    connections: (connections ?? []) as Connection[],
    logs: allLogs,
    stats: {
      totalSyncs: allLogs.length,
      successRate,
      avgLatencyMs: avgLatency,
      doublesSaved: successCount,
    },
  }
}

export default async function DashboardPage() {
  const { userId, connections, logs, stats } = await getData()
  return (
    <DashboardClient
      userId={userId}
      initialConnections={connections}
      initialLogs={logs}
      stats={stats}
    />
  )
}
