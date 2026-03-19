'use client'

import { Package } from 'lucide-react'

export interface StockSnapshot {
  id: string
  platform: string
  listing_id: string
  listing_title: string
  quantity: number
  alerted: boolean
  snapshot_at: string
}

interface Props {
  snapshots: StockSnapshot[]
  threshold: number
}

const PLATFORM_LABELS: Record<string, string> = {
  shopify: 'Shopify',
  etsy: 'Etsy',
  ebay: 'eBay',
}

export function StockAlertsPanel({ snapshots, threshold }: Props) {
  if (snapshots.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-[#c49a3c]" />
        <h2 className="text-sm font-semibold text-[#b8b0a6] uppercase tracking-wide">Low Stock Alerts</h2>
        <span className="px-2 py-0.5 rounded-full bg-[#c49a3c]/10 border border-[#c49a3c]/20 text-xs text-[#c49a3c]">
          {snapshots.length}
        </span>
      </div>

      <div className="rounded-xl border border-[#c49a3c]/15 bg-[#212120] overflow-hidden">
        <div className="px-4 py-3 bg-[#c49a3c]/5 border-b border-[#c49a3c]/10">
          <p className="text-xs text-[#c49a3c]">
            Items at or below {threshold} unit{threshold === 1 ? '' : 's'} — live on multiple platforms. One sale and they&apos;re gone.
          </p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {snapshots.map((snap) => (
            <div key={snap.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <Package className="w-4 h-4 text-[#c49a3c] shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-[#f0ece6] truncate">{snap.listing_title}</p>
                  <p className="text-xs text-[#4a4540]">{PLATFORM_LABELS[snap.platform] ?? snap.platform}</p>
                </div>
              </div>
              <div className="shrink-0 ml-4 text-right">
                <span
                  className={`text-sm font-bold ${snap.quantity <= 1 ? 'text-[#c0554e]' : 'text-[#c49a3c]'}`}
                >
                  {snap.quantity} left
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
