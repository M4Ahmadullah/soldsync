'use client'

import { useState } from 'react'
import type { DailyCount } from '@/app/(app)/dashboard/page'

interface Props { data: DailyCount[] }

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function SyncChart({ data }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)

  const maxTotal = Math.max(...data.map(d => d.success + d.failed), 1)
  const BAR_H = 80
  const hasActivity = data.some(d => d.success + d.failed > 0)

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#1e1d1b] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#3a3530]">Last 7 days</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[10px] text-[#4a4540]">
            <span className="w-2 h-2 rounded-sm bg-[#4a9d6e]" /> Success
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-[#4a4540]">
            <span className="w-2 h-2 rounded-sm bg-[#c0554e]" /> Failed
          </span>
        </div>
      </div>

      {!hasActivity ? (
        <div className="h-[100px] flex items-center justify-center">
          <p className="text-xs text-[#3a3530]">No syncs yet — connect your platforms to get started.</p>
        </div>
      ) : (
        <div className="flex items-end gap-1.5 h-[100px] relative">
          {data.map((d, i) => {
            const total     = d.success + d.failed
            const succH     = Math.round((d.success / maxTotal) * BAR_H)
            const failH     = Math.round((d.failed  / maxTotal) * BAR_H)
            const day       = new Date(d.date + 'T12:00:00Z')
            const label     = DAY_LABELS[day.getUTCDay()]
            const isToday   = d.date === new Date().toISOString().slice(0, 10)
            const isHovered = hovered === i

            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-0.5 cursor-default"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Tooltip */}
                {isHovered && total > 0 && (
                  <div className="absolute bottom-[108px] left-1/2 -translate-x-1/2 bg-[#141311] border border-white/[0.10] rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap z-10 pointer-events-none shadow-lg"
                    style={{ left: `${(i / data.length) * 100 + (1 / data.length) * 50}%` }}
                  >
                    <p className="text-[#7a7268] mb-0.5">{new Date(d.date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p className="text-[#4a9d6e]">{d.success} success</p>
                    {d.failed > 0 && <p className="text-[#c0554e]">{d.failed} failed</p>}
                  </div>
                )}

                {/* Bar stack */}
                <div className="w-full flex flex-col-reverse items-stretch gap-px" style={{ height: BAR_H }}>
                  {d.success > 0 && (
                    <div
                      className="w-full rounded-sm transition-all duration-200"
                      style={{ height: succH, backgroundColor: isHovered ? '#5aad7e' : '#4a9d6e', opacity: total === 0 ? 0 : 1 }}
                    />
                  )}
                  {d.failed > 0 && (
                    <div
                      className="w-full rounded-sm transition-all duration-200"
                      style={{ height: failH, backgroundColor: isHovered ? '#d0645e' : '#c0554e' }}
                    />
                  )}
                  {total === 0 && (
                    <div className="w-full rounded-sm" style={{ height: 2, backgroundColor: 'rgba(255,255,255,0.04)' }} />
                  )}
                </div>

                {/* Day label */}
                <p className={`text-[10px] mt-1 ${isToday ? 'text-[#c97a40] font-semibold' : 'text-[#3a3530]'}`}>
                  {label}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
