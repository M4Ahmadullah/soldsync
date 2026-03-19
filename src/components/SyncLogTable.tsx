'use client'

import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, XCircle, MinusCircle, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type SyncStatus = 'success' | 'failed' | 'no_match'

export interface SyncLog {
  id: string
  source_platform: string
  target_platform: string
  listing_title: string
  status: SyncStatus
  error_message?: string | null
  delist_latency_ms?: number | null
  created_at: string
}

interface SyncLogTableProps {
  logs: SyncLog[]
}

const STATUS_META: Record<SyncStatus, {
  icon: React.ReactNode
  label: string
  variant: 'success' | 'destructive' | 'warning'
}> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    label: 'Delisted',
    variant: 'success',
  },
  failed: {
    icon: <XCircle className="h-4 w-4 text-red-500" />,
    label: 'Failed',
    variant: 'destructive',
  },
  no_match: {
    icon: <MinusCircle className="h-4 w-4 text-amber-500" />,
    label: 'No match',
    variant: 'warning',
  },
}

const PLATFORM_LABEL: Record<string, string> = {
  ebay: 'eBay',
  etsy: 'Etsy',
}

export function SyncLogTable({ logs }: SyncLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-zinc-100 p-4">
          <CheckCircle2 className="h-8 w-8 text-zinc-400" />
        </div>
        <p className="mt-3 text-sm font-medium text-zinc-700">No syncs yet</p>
        <p className="mt-1 text-sm text-zinc-400">
          Connect your platforms above to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100">
            <th className="pb-3 pr-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Status
            </th>
            <th className="pb-3 pr-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Item
            </th>
            <th className="pb-3 pr-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide hidden sm:table-cell">
              Flow
            </th>
            <th className="pb-3 pr-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide hidden md:table-cell">
              Latency
            </th>
            <th className="pb-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {logs.map((log) => {
            const statusMeta = STATUS_META[log.status]
            return (
              <tr key={log.id} className="group hover:bg-zinc-50 transition-colors">
                {/* Status */}
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2">
                    {statusMeta.icon}
                    <Badge variant={statusMeta.variant} className="hidden sm:inline-flex">
                      {statusMeta.label}
                    </Badge>
                  </div>
                </td>

                {/* Item title */}
                <td className="py-3.5 pr-4 max-w-[220px]">
                  <p className="truncate font-medium text-zinc-800">{log.listing_title}</p>
                  {log.error_message && (
                    <p className="mt-0.5 truncate text-xs text-red-500">{log.error_message}</p>
                  )}
                </td>

                {/* Flow */}
                <td className="py-3.5 pr-4 hidden sm:table-cell">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium">
                      {PLATFORM_LABEL[log.source_platform]}
                    </span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium">
                      {PLATFORM_LABEL[log.target_platform]}
                    </span>
                  </div>
                </td>

                {/* Latency */}
                <td className="py-3.5 pr-4 hidden md:table-cell">
                  {log.delist_latency_ms != null ? (
                    <span className={`text-xs font-mono ${
                      log.delist_latency_ms < 1000 ? 'text-emerald-600' :
                      log.delist_latency_ms < 2000 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {log.delist_latency_ms < 1000
                        ? `${log.delist_latency_ms}ms`
                        : `${(log.delist_latency_ms / 1000).toFixed(1)}s`
                      }
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-300">—</span>
                  )}
                </td>

                {/* Time */}
                <td className="py-3.5">
                  <span className="text-xs text-zinc-400">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
