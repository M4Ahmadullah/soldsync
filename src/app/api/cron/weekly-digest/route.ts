import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendWeeklyDigest } from '@/lib/email'

// Runs every Sunday at 9am UTC (see vercel.json)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ message: 'Mock mode — skipping cron' })
  }

  const supabase = createServiceClient()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Get all users who have weekly digest enabled
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, notification_prefs')
    .filter('notification_prefs->email_weekly_digest', 'eq', true)
    .in('subscription_status', ['active', 'trialing', 'past_due'])

  if (!profiles?.length) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0

  for (const profile of profiles) {
    try {
      // Get this user's sync stats for the past 7 days
      const { data: logs } = await supabase
        .from('sync_logs')
        .select('status, source_platform, target_platform, delist_latency_ms, created_at')
        .eq('user_id', profile.id)
        .gte('created_at', since)

      const allLogs = logs ?? []
      const total = allLogs.length
      const successes = allLogs.filter((l) => l.status === 'success').length
      const failures = allLogs.filter((l) => l.status === 'failed').length
      const noMatches = allLogs.filter((l) => l.status === 'no_match').length
      const successRate = total > 0 ? Math.round((successes / total) * 100) : 0
      const avgLatency = successes > 0
        ? Math.round(allLogs.filter((l) => l.status === 'success')
            .reduce((s, l) => s + (l.delist_latency_ms ?? 0), 0) / successes)
        : 0

      await sendWeeklyDigest({
        email: profile.email,
        stats: { total, successes, failures, noMatches, successRate, avgLatencyMs: avgLatency },
        weekStart: since,
      })

      sent++
    } catch (err) {
      console.error(`Weekly digest error for user ${profile.id}:`, err)
    }
  }

  return NextResponse.json({ sent, total: profiles.length })
}
