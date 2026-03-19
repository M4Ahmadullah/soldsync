'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Prefs {
  email_on_failure: boolean
  email_on_no_match: boolean
  email_weekly_digest: boolean
  price_sync_enabled: boolean
  email_on_low_stock: boolean
  low_stock_threshold: number
}

const DEFAULT_PREFS: Prefs = {
  email_on_failure: true,
  email_on_no_match: false,
  email_weekly_digest: false,
  price_sync_enabled: false,
  email_on_low_stock: true,
  low_stock_threshold: 2,
}

const SETTINGS = [
  {
    key: 'email_on_failure' as const,
    label: 'Sync failure alerts',
    description: 'Get emailed immediately when a delist fails so you can prevent a double-sale.',
    badge: 'Recommended',
  },
  {
    key: 'email_on_no_match' as const,
    label: 'No-match alerts',
    description: "Get notified when we can't find a matching listing on the target platform.",
    badge: null,
  },
  {
    key: 'email_weekly_digest' as const,
    label: 'Weekly sync digest',
    description: 'A Sunday summary of your sync activity, success rate, and any issues.',
    badge: null,
  },
  {
    key: 'price_sync_enabled' as const,
    label: 'Price sync',
    description: 'Automatically update prices on Etsy and eBay when you change a price on Shopify.',
    badge: 'New',
  },
  {
    key: 'email_on_low_stock' as const,
    label: 'Low stock alerts',
    description: 'Get emailed when an item falls to your threshold quantity and is live on multiple platforms.',
    badge: null,
  },
]

export function NotificationSettings({ userId }: { userId: string }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('profiles')
      .select('notification_prefs')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data?.notification_prefs) {
          setPrefs({ ...DEFAULT_PREFS, ...(data.notification_prefs as Partial<Prefs>) })
        }
      })
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function toggle(key: keyof Prefs) {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    setSaving(true)
    setSaved(false)

    await supabase
      .from('profiles')
      .update({ notification_prefs: next })
      .eq('id', userId)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-2">
      {SETTINGS.map((s) => (
        <div
          key={s.key}
          className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-[#1a1916] px-4 py-3.5 transition-colors hover:border-white/[0.10]"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-[#f0ece6]">{s.label}</p>
              {s.badge && (
                <span className="rounded-full bg-[#4a9d6e]/15 border border-[#4a9d6e]/25 px-2 py-0.5 text-[10px] font-semibold text-[#4a9d6e]">
                  {s.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-[#7a7268] mt-0.5 leading-relaxed">{s.description}</p>
          </div>
          <button
            onClick={() => toggle(s.key)}
            aria-label={prefs[s.key] ? 'Disable' : 'Enable'}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c97a40]/50 ${
              prefs[s.key] ? 'bg-[#c97a40]' : 'bg-[#2a2927] border-white/10'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                prefs[s.key] ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      ))}

      {/* Low stock threshold selector */}
      {prefs.email_on_low_stock && (
        <div className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-[#1a1916] px-4 py-3.5">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#f0ece6]">Low stock threshold</p>
            <p className="text-xs text-[#7a7268] mt-0.5">Alert when quantity falls to this number or below.</p>
          </div>
          <select
            value={prefs.low_stock_threshold}
            onChange={async (e) => {
              const next = { ...prefs, low_stock_threshold: Number(e.target.value) }
              setPrefs(next)
              setSaving(true)
              setSaved(false)
              await supabase.from('profiles').update({ notification_prefs: next }).eq('id', userId)
              setSaving(false)
              setSaved(true)
              setTimeout(() => setSaved(false), 2000)
            }}
            className="bg-[#2a2927] border border-white/[0.09] rounded-lg px-3 py-1.5 text-sm text-[#f0ece6] outline-none focus:border-white/[0.18] transition-colors"
          >
            {[1, 2, 3, 5, 10].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}

      <p className={`text-xs text-[#7a7268] pt-1 h-4 transition-opacity ${saved || saving ? 'opacity-100' : 'opacity-0'}`}>
        {saving ? 'Saving…' : 'Preferences saved ✓'}
      </p>
    </div>
  )
}
