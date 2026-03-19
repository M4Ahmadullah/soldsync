'use client'

import { DollarSign } from 'lucide-react'

export interface PriceSyncLogEntry {
  id: string
  source_platform: string
  listing_title: string
  old_price: number | null
  new_price: number
  targets_updated: Array<{ platform: string; status: string }>
  status: 'success' | 'partial' | 'failed' | 'no_match'
  error_message: string | null
  created_at: string
}

interface Props {
  logs: PriceSyncLogEntry[]
}

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  success: { label: '✓ Synced', color: '#4a9d6e' },
  partial: { label: '~ Partial', color: '#c49a3c' },
  failed: { label: '✗ Failed', color: '#c0554e' },
  no_match: { label: '~ No match', color: '#c49a3c' },
}

function fmt(price: number | null): string {
  if (price == null) return '—'
  return `$${price.toFixed(2)}`
}

export function PriceSyncLog({ logs }: Props) {
  if (logs.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-[#4a9d6e]" />
        <h2 className="text-sm font-semibold text-[#b8b0a6] uppercase tracking-wide">Price Sync</h2>
        <span className="px-2 py-0.5 rounded-full bg-[#212120] border border-white/[0.07] text-xs text-[#4a4540]">
          {logs.length} recent
        </span>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-[#212120] overflow-hidden">
        <div className="divide-y divide-white/[0.04]">
          {logs.map((log) => {
            const style = STATUS_STYLES[log.status] ?? STATUS_STYLES.failed
            return (
              <div key={log.id} className="flex items-center gap-4 px-4 py-3">
                <DollarSign className="w-4 h-4 text-[#4a9d6e] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f0ece6] truncate">{log.listing_title}</p>
                  <p className="text-xs text-[#4a4540]">
                    {log.source_platform} · {fmt(log.old_price)} → {fmt(log.new_price)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs font-medium" style={{ color: style.color }}>
                    {style.label}
                  </span>
                  <p className="text-xs text-[#3a3733]">
                    {new Date(log.created_at).toLocaleTimeString('en-US', { hour12: false })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
