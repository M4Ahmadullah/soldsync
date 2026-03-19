'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Tag, ShoppingCart, Terminal,
  Settings, LogOut, Zap, ShieldCheck, TrendingUp, CheckCircle2,
  ArrowRight, AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { SyncLog } from './SyncLogTable'
import Link from 'next/link'

interface Connection {
  id: string
  platform: string
  platform_username?: string | null
  is_active: boolean
}

interface Stats {
  totalSyncs: number
  successRate: number
  avgLatencyMs: number
  doublesSaved: number
}

interface PlatformConfig {
  id: string
  label: string
  hex: string
  icon: React.ReactNode
  connectUrl: string
  disconnectUrl: string
  shopify?: boolean
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'shopify',
    label: 'Shopify',
    hex: '#6da84a',
    icon: <ShoppingBag className="w-[18px] h-[18px]" />,
    connectUrl: '/api/oauth/shopify/start',
    disconnectUrl: '/api/oauth/shopify/disconnect',
    shopify: true,
  },
  {
    id: 'etsy',
    label: 'Etsy',
    hex: '#c97a40',
    icon: <Tag className="w-[18px] h-[18px]" />,
    connectUrl: '/api/oauth/etsy/start',
    disconnectUrl: '/api/oauth/etsy/disconnect',
  },
  {
    id: 'ebay',
    label: 'eBay',
    hex: '#5b8fc4',
    icon: <ShoppingCart className="w-[18px] h-[18px]" />,
    connectUrl: '/api/oauth/ebay/start',
    disconnectUrl: '/api/oauth/ebay/disconnect',
  },
]

interface Props {
  userId: string
  initialConnections: Connection[]
  initialLogs: SyncLog[]
  stats: Stats
}

export function DashboardClient({ userId, initialConnections, initialLogs, stats }: Props) {
  const [logs, setLogs] = useState<SyncLog[]>(initialLogs)
  const [connections, setConnections] = useState<Connection[]>(initialConnections)
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null)
  const [shopifyPrompt, setShopifyPrompt] = useState(false)
  const [shopDomain, setShopDomain] = useState('')
  const [newLogIds, setNewLogIds] = useState<Set<string>>(new Set())

  // Supabase Realtime live sync log updates
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('dashboard_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sync_logs',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const newLog = payload.new as SyncLog
        setLogs((prev) => [newLog, ...prev].slice(0, 50))
        setNewLogIds((prev) => new Set([...prev, newLog.id]))
        setTimeout(() => setNewLogIds((prev) => { const s = new Set(prev); s.delete(newLog.id); return s }), 2000)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const connectedCount = PLATFORMS.filter((p) => connections.some((c) => c.platform === p.id && c.is_active)).length
  const allConnected = connectedCount === PLATFORMS.length

  const isConnected = (id: string) => connections.some((c) => c.platform === id && c.is_active)
  const getUsername = (id: string) => connections.find((c) => c.platform === id)?.platform_username

  const handleConnect = (platform: PlatformConfig) => {
    if (platform.shopify) {
      setShopifyPrompt(true)
    } else {
      window.location.href = platform.connectUrl
    }
  }

  const handleShopifyConnect = () => {
    if (!shopDomain.trim()) return
    const domain = shopDomain.includes('.myshopify.com') ? shopDomain : `${shopDomain}.myshopify.com`
    window.location.href = `/api/oauth/shopify/start?shop=${domain}`
  }

  const handleDisconnect = async (platform: PlatformConfig) => {
    setLoadingPlatform(platform.id)
    try {
      await fetch(platform.disconnectUrl, { method: 'POST' })
      setConnections((prev) => prev.filter((c) => c.platform !== platform.id))
    } finally {
      setLoadingPlatform(null)
    }
  }

  const STAT_CARDS = [
    { label: 'Total Syncs', value: stats.totalSyncs, icon: <Zap className="w-4 h-4" />, color: '#c49a3c' },
    { label: 'Success Rate', value: `${stats.successRate}%`, icon: <CheckCircle2 className="w-4 h-4" />, color: '#4a9d6e' },
    { label: 'Avg Latency', value: stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs}ms` : '—', icon: <TrendingUp className="w-4 h-4" />, color: '#7a9ec4' },
    { label: 'Doubles Prevented', value: stats.doublesSaved, icon: <ShieldCheck className="w-4 h-4" />, color: '#c97a40' },
  ]

  return (
    <div className="min-h-screen bg-[#1a1916] text-[#f0ece6]">

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#1a1916]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-base font-bold text-[#f0ece6]">
              Sold<span className="text-[#c97a40]">Sync</span>
            </Link>
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              allConnected
                ? 'border-[#4a9d6e]/25 bg-[#4a9d6e]/10 text-[#4a9d6e]'
                : 'border-[#c49a3c]/25 bg-[#c49a3c]/10 text-[#c49a3c]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${allConnected ? 'bg-[#4a9d6e] animate-pulse' : 'bg-[#c49a3c]'}`} />
              {allConnected ? 'Active' : `${connectedCount}/${PLATFORMS.length} connected`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/settings">
              <button className="p-2.5 rounded-lg hover:bg-white/[0.05] text-[#4a4540] hover:text-[#b8b0a6] transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="p-2.5 rounded-lg hover:bg-white/[0.05] text-[#4a4540] hover:text-[#b8b0a6] transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f0ece6]">Command Center</h1>
          <p className="text-[#4a4540] mt-1 text-sm">Monitor and manage your real-time inventory sync.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/[0.07] bg-[#212120] p-5 relative overflow-hidden hover:border-white/[0.10] transition-colors">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl -mr-6 -mt-6 opacity-20" style={{ backgroundColor: s.color }} />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <p className="text-xs text-[#4a4540] font-medium">{s.label}</p>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <p className="text-2xl font-bold relative z-10 text-[#f0ece6]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Platform Connections */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c97a40]" />
            <h2 className="text-sm font-semibold text-[#b8b0a6] uppercase tracking-wide">Platform Connections</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLATFORMS.map((platform) => {
              const connected = isConnected(platform.id)
              const username = getUsername(platform.id)
              const isLoading = loadingPlatform === platform.id
              return (
                <motion.div
                  key={platform.id}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className={`rounded-2xl border bg-[#212120] p-6 relative overflow-hidden transition-all duration-200 ${
                    connected
                      ? 'border-[#4a9d6e]/20 hover:border-[#4a9d6e]/35'
                      : 'border-white/[0.07] hover:border-white/[0.12] opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-12 -mt-12 opacity-8 pointer-events-none" style={{ backgroundColor: platform.hex }} />

                  <div className="flex items-start justify-between mb-5 relative z-10">
                    <div
                      className="p-2.5 rounded-xl bg-[#1a1916] border border-white/[0.07]"
                      style={{ color: platform.hex }}
                    >
                      {platform.icon}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#4a9d6e]' : 'bg-[#2a2927]'}`} />
                      <span className="text-xs text-[#4a4540]">{connected ? 'Active' : 'Disconnected'}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold mb-1 relative z-10 text-[#f0ece6]">{platform.label}</h3>
                  {username && (
                    <p className="text-xs text-[#4a4540] truncate mb-3 relative z-10">@{username}</p>
                  )}

                  {connected ? (
                    <button
                      onClick={() => handleDisconnect(platform)}
                      disabled={isLoading}
                      className="text-xs text-[#4a4540] hover:text-[#c0554e] transition-colors relative z-10 mt-1 disabled:opacity-40"
                    >
                      {isLoading ? 'Disconnecting…' : 'Revoke access'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(platform)}
                      className="relative z-10 mt-2 flex items-center gap-1.5 text-sm font-medium px-4 py-2 w-full justify-center rounded-lg bg-[#1a1916] hover:bg-[#2a2927] transition-colors border border-white/[0.07] text-[#b8b0a6] hover:text-[#f0ece6]"
                    >
                      Connect
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Title matching notice */}
        {connectedCount >= 2 && (
          <div className="rounded-xl border border-[#c49a3c]/15 bg-[#c49a3c]/5 p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#c49a3c] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#b8b0a6]">Title matching requirement</p>
              <p className="text-xs text-[#7a7268] mt-1 leading-relaxed">
                SoldSync matches listings by title similarity (≥90%). Keep titles identical — or very close — across all platforms for reliable auto-delist. Mismatches are logged as <span className="text-[#c49a3c] font-medium">no match</span>.
              </p>
            </div>
          </div>
        )}

        {/* Live Sync Terminal */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-[#c97a40]" />
              <h2 className="text-sm font-semibold text-[#b8b0a6] uppercase tracking-wide">Live Sync Feed</h2>
              {logs.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#212120] border border-white/[0.07] text-xs text-[#4a4540]">
                  {logs.length} events
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#212120] border border-[#4a9d6e]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a9d6e] animate-pulse" />
              <span className="text-xs text-[#4a9d6e]/70 font-mono">live</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#212120] overflow-hidden">
            {/* Window chrome */}
            <div className="px-5 py-3 bg-[#1a1916] border-b border-white/[0.06] flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#c0554e]/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#c49a3c]/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#4a9d6e]/50" />
              <span className="ml-4 text-xs text-[#4a4540] font-mono">worker@soldsync ~ tail -f sync.log</span>
            </div>

            <div className="p-5 h-96 overflow-y-auto font-mono text-xs space-y-1 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-[#2e2c28]">
                  <Terminal className="w-7 h-7 opacity-40" />
                  <span className="text-[#4a4540]">No sync events yet — connect your platforms to get started.</span>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -6, backgroundColor: 'rgba(201,122,64,0.06)' }}
                      animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0,0,0,0)' }}
                      transition={{ duration: 0.35 }}
                      className={`flex flex-col sm:flex-row gap-1 sm:gap-4 py-1.5 px-2 rounded-lg border-b border-white/[0.03] last:border-0 ${newLogIds.has(log.id) ? 'bg-[#c97a40]/5' : ''}`}
                    >
                      <span className="text-[#2e2c28] shrink-0 w-20">
                        [{new Date(log.created_at).toLocaleTimeString('en-US', { hour12: false })}]
                      </span>
                      <span className={`shrink-0 w-24 font-semibold ${
                        log.status === 'success' ? 'text-[#4a9d6e]' :
                        log.status === 'failed' ? 'text-[#c0554e]' : 'text-[#c49a3c]'
                      }`}>
                        {log.status === 'success' ? '✓ SUCCESS' : log.status === 'failed' ? '✗ FAILED' : '~ NO_MATCH'}
                      </span>
                      <span className="text-[#4a4540] shrink-0 w-28 capitalize">{log.source_platform}→{log.target_platform}</span>
                      <span className="text-[#7a7268] truncate">
                        {log.status === 'success'
                          ? `"${log.listing_title}" delisted (${log.delist_latency_ms ?? '—'}ms)`
                          : log.status === 'failed'
                          ? `"${log.listing_title}" — ${log.error_message ?? 'unknown error'}`
                          : `"${log.listing_title}" — no match found`
                        }
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <div className="flex gap-2 items-center pt-2 text-[#2e2c28]">
                <span>❯</span>
                <span className="w-2 h-3 bg-[#2e2c28] animate-pulse inline-block rounded-sm" />
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Shopify domain modal */}
      <AnimatePresence>
        {shopifyPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShopifyPrompt(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="rounded-2xl border border-white/[0.09] bg-[#212120] p-8 w-full max-w-sm shadow-[0_8px_48px_rgba(0,0,0,0.6)]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold mb-1.5 text-[#f0ece6]">Connect Shopify</h3>
              <p className="text-sm text-[#7a7268] mb-6">Enter your Shopify store domain to continue.</p>
              <div className="flex items-center rounded-xl border border-white/[0.09] bg-[#1a1916] overflow-hidden mb-4">
                <input
                  autoFocus
                  type="text"
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleShopifyConnect()}
                  placeholder="mystore"
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#2e2c28] outline-none"
                />
                <span className="text-sm text-[#4a4540] pr-4 shrink-0">.myshopify.com</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShopifyPrompt(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-[#7a7268] hover:text-[#b8b0a6] transition-colors hover:bg-white/[0.03]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShopifyConnect}
                  disabled={!shopDomain.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#c97a40] hover:bg-[#b86c34] text-sm font-medium transition-colors disabled:opacity-40 text-white"
                >
                  Connect
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
