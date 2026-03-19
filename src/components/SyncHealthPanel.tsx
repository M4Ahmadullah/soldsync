'use client'

import { AlertCircle } from 'lucide-react'

interface Connection {
  id: string
  platform: string
  platform_username?: string | null
  is_active: boolean
  last_webhook_at?: string | null
}

interface HealthState {
  label: string
  color: string
  dotColor: string
}

function getHealthState(conn: Connection | undefined): HealthState {
  if (!conn || !conn.is_active) {
    return { label: 'Not connected', color: '#7a7268', dotColor: '#3a3733' }
  }
  if (!conn.last_webhook_at) {
    return { label: 'Silent', color: '#c0554e', dotColor: '#c0554e' }
  }
  const ageMs = Date.now() - new Date(conn.last_webhook_at).getTime()
  const hours = ageMs / (1000 * 60 * 60)
  if (hours < 24) return { label: 'Healthy', color: '#4a9d6e', dotColor: '#4a9d6e' }
  if (hours < 7 * 24) return { label: 'Stale', color: '#c49a3c', dotColor: '#c49a3c' }
  return { label: 'Silent', color: '#c0554e', dotColor: '#c0554e' }
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never received'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

const PLATFORM_LABELS: Record<string, string> = {
  shopify: 'Shopify',
  etsy: 'Etsy',
  ebay: 'eBay',
}

interface Props {
  connections: Connection[]
}

export function SyncHealthPanel({ connections }: Props) {
  const platforms = ['shopify', 'etsy', 'ebay']

  const alerts: string[] = []
  for (const platform of platforms) {
    const conn = connections.find((c) => c.platform === platform)
    const state = getHealthState(conn)
    if (state.label === 'Stale' || state.label === 'Silent') {
      const age = conn?.last_webhook_at ? timeAgo(conn.last_webhook_at) : 'never'
      alerts.push(`${PLATFORM_LABELS[platform]} webhooks haven't fired${age === 'Never received' ? ' yet' : ` in ${age}`} — check your store connection.`)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-[#7a9ec4]" />
        <h2 className="text-sm font-semibold text-[#b8b0a6] uppercase tracking-wide">Platform Health</h2>
      </div>

      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((msg) => (
            <div key={msg} className="rounded-xl border border-[#c49a3c]/20 bg-[#c49a3c]/5 p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#c49a3c] mt-0.5 shrink-0" />
              <p className="text-xs text-[#b8b0a6] leading-relaxed">{msg}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {platforms.map((platform) => {
          const conn = connections.find((c) => c.platform === platform)
          const state = getHealthState(conn)
          return (
            <div
              key={platform}
              className="rounded-xl border border-white/[0.07] bg-[#212120] p-4 hover:border-white/[0.10] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#f0ece6]">{PLATFORM_LABELS[platform]}</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: state.dotColor }}
                  />
                  <span className="text-xs font-medium" style={{ color: state.color }}>
                    {state.label}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#4a4540]">
                {conn?.is_active
                  ? timeAgo(conn.last_webhook_at)
                  : 'Not connected'}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
