'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'

interface Connection {
  id: string
  platform: string
  is_active: boolean
}

interface PlatformResult {
  platform: string
  status: 'success' | 'no_match' | 'failed'
  message: string
}

interface Props {
  connections: Connection[]
}

const PLATFORM_LABELS: Record<string, string> = {
  shopify: 'Shopify',
  etsy: 'Etsy',
  ebay: 'eBay',
}

export function ManualSyncPanel({ connections }: Props) {
  const activePlatforms = connections.filter((c) => c.is_active).map((c) => c.platform)
  const [title, setTitle] = useState('')
  const [selected, setSelected] = useState<string[]>(activePlatforms)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<PlatformResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const toggle = (platform: string) => {
    setSelected((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    )
  }

  const handleSubmit = async () => {
    if (!title.trim() || selected.length === 0) return
    setLoading(true)
    setResults(null)
    setError(null)

    try {
      const res = await fetch('/api/sync/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_title: title.trim(), target_platforms: selected }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
      } else {
        setResults(data.results as PlatformResult[])
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-[#c0554e]" />
        <h2 className="text-sm font-semibold text-[#b8b0a6] uppercase tracking-wide">Manual Sync</h2>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-[#212120] p-5 space-y-4">
        <div>
          <label className="text-xs text-[#7a7268] mb-1.5 block">Listing title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder='e.g. "Nike Air Max 90 Size 10"'
            className="w-full bg-[#1a1916] border border-white/[0.09] rounded-lg px-3.5 py-2.5 text-sm text-[#f0ece6] placeholder:text-[#2e2c28] outline-none focus:border-white/[0.18] transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-[#7a7268] mb-2 block">Delist from</label>
          <div className="flex flex-wrap gap-2">
            {activePlatforms.length === 0 ? (
              <p className="text-xs text-[#4a4540]">No platforms connected</p>
            ) : (
              activePlatforms.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => toggle(platform)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selected.includes(platform)
                      ? 'border-[#c0554e]/40 bg-[#c0554e]/10 text-[#c0554e]'
                      : 'border-white/[0.07] bg-[#1a1916] text-[#4a4540] hover:text-[#b8b0a6]'
                  }`}
                >
                  {PLATFORM_LABELS[platform] ?? platform}
                </button>
              ))
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !title.trim() || selected.length === 0}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#c0554e] hover:bg-[#a84844] text-white text-sm font-medium transition-colors disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          {loading ? 'Delisting…' : 'Delist Everywhere'}
        </button>

        {error && (
          <p className="text-xs text-[#c0554e]">{error}</p>
        )}

        {results && (
          <div className="space-y-1.5 pt-1">
            {results.map((r) => (
              <div
                key={r.platform}
                className="flex items-center justify-between rounded-lg bg-[#1a1916] border border-white/[0.06] px-3.5 py-2.5"
              >
                <span className="text-sm text-[#b8b0a6]">{PLATFORM_LABELS[r.platform] ?? r.platform}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${
                      r.status === 'success'
                        ? 'text-[#4a9d6e]'
                        : r.status === 'no_match'
                        ? 'text-[#c49a3c]'
                        : 'text-[#c0554e]'
                    }`}
                  >
                    {r.status === 'success' ? '✓ Delisted' : r.status === 'no_match' ? '~ No match' : '✗ Failed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
