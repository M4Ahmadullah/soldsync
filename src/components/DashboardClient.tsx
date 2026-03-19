'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Plug, Terminal, MousePointerClick,
  DollarSign, Package, Settings, LogOut, Menu, X,
  Zap, ShieldCheck, TrendingUp, CheckCircle2,
  ArrowRight, AlertTriangle, Bell, CreditCard,
  ExternalLink, Check, Search, Filter,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ShopifyLogo, EbayLogo, EtsyLogo } from './PlatformLogos'
import type { SyncLog } from './SyncLogTable'
import type { PriceSyncLogEntry } from './PriceSyncLog'
import type { StockSnapshot } from './StockAlertsPanel'
import type { DailyCount } from '@/app/(app)/dashboard/page'
import { SyncHealthPanel } from './SyncHealthPanel'
import { ManualSyncPanel } from './ManualSyncPanel'
import { PriceSyncLog } from './PriceSyncLog'
import { StockAlertsPanel } from './StockAlertsPanel'
import { NotificationSettings } from './NotificationSettings'
import SyncChart from './SyncChart'
import Link from 'next/link'

// ── Types ────────────────────────────────────────────────────────────────────

interface Connection {
  id: string; platform: string; platform_username?: string | null
  is_active: boolean; last_webhook_at?: string | null
}
interface Stats { totalSyncs: number; successRate: number; avgLatencyMs: number; doublesSaved: number }

interface Props {
  userId: string; userEmail: string; subscriptionStatus: string
  initialConnections: Connection[]; initialLogs: SyncLog[]
  dailySyncs: DailyCount[]; monthlyCount: number
  priceSyncLogs: PriceSyncLogEntry[]; stockSnapshots: StockSnapshot[]
  lowStockThreshold: number; stats: Stats
}

// ── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: 'shopify', label: 'Shopify', hex: '#95bf47', Icon: ShopifyLogo, iconSize: 22, connectUrl: '/api/oauth/shopify/start', disconnectUrl: '/api/oauth/shopify/disconnect', shopify: true },
  { id: 'etsy',    label: 'Etsy',    hex: '#f1641e', Icon: EtsyLogo,   iconSize: 16, connectUrl: '/api/oauth/etsy/start',    disconnectUrl: '/api/oauth/etsy/disconnect' },
  { id: 'ebay',    label: 'eBay',    hex: '#e53238', Icon: EbayLogo,   iconSize: 16, connectUrl: '/api/oauth/ebay/start',    disconnectUrl: '/api/oauth/ebay/disconnect' },
]

// ── Health helpers ────────────────────────────────────────────────────────────

function getHealthLabel(conn: Connection | undefined): 'healthy' | 'stale' | 'silent' | 'disconnected' {
  if (!conn || !conn.is_active) return 'disconnected'
  if (!conn.last_webhook_at) return 'silent'
  const hours = (Date.now() - new Date(conn.last_webhook_at).getTime()) / 3600000
  if (hours < 24) return 'healthy'
  if (hours < 168) return 'stale'
  return 'silent'
}

// ── Nav ───────────────────────────────────────────────────────────────────────

type View = 'overview' | 'connections' | 'feed' | 'manual' | 'price' | 'stock' | 'settings'

const NAV: { id: View; label: string; Icon: React.ElementType }[] = [
  { id: 'overview',    label: 'Overview',      Icon: LayoutDashboard },
  { id: 'connections', label: 'Connections',   Icon: Plug },
  { id: 'feed',        label: 'Live Feed',     Icon: Terminal },
  { id: 'manual',      label: 'Manual Delist', Icon: MousePointerClick },
  { id: 'price',       label: 'Price Sync',    Icon: DollarSign },
  { id: 'stock',       label: 'Low Stock',     Icon: Package },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:   { label: 'Active',   cls: 'text-[#4a9d6e] bg-[#4a9d6e]/10 border-[#4a9d6e]/25' },
    trialing: { label: 'Trial',    cls: 'text-[#4a9d6e] bg-[#4a9d6e]/10 border-[#4a9d6e]/25' },
    past_due: { label: 'Past due', cls: 'text-[#c49a3c] bg-[#c49a3c]/10 border-[#c49a3c]/25' },
  }
  const m = map[status] ?? { label: 'Inactive', cls: 'text-[#4a4540] bg-white/[0.04] border-white/[0.08]' }
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${m.cls}`}>{m.label}</span>
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardClient({
  userId, userEmail, subscriptionStatus,
  initialConnections, initialLogs,
  dailySyncs, monthlyCount,
  priceSyncLogs, stockSnapshots, lowStockThreshold, stats,
}: Props) {
  const [view, setView]               = useState<View>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logs, setLogs]               = useState<SyncLog[]>(initialLogs)
  const [connections, setConnections] = useState<Connection[]>(initialConnections)
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null)
  const [shopifyPrompt, setShopifyPrompt]     = useState(false)
  const [shopDomain, setShopDomain]           = useState('')
  const [newLogIds, setNewLogIds]             = useState<Set<string>>(new Set())

  // Feed filters
  const [feedStatus,   setFeedStatus]   = useState<'all' | 'success' | 'failed' | 'no_match'>('all')
  const [feedPlatform, setFeedPlatform] = useState('all')
  const [feedSearch,   setFeedSearch]   = useState('')

  // Global search
  const [searchQuery,  setSearchQuery]  = useState('')
  const [searchOpen,   setSearchOpen]   = useState(false)
  const searchRef      = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Account deletion
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteInput,   setDeleteInput]   = useState('')
  const [deleting,      setDeleting]      = useState(false)

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return
    setDeleting(true)
    const res = await fetch('/api/account/delete', { method: 'DELETE' })
    if (res.ok) {
      window.location.href = '/'
    } else {
      setDeleting(false)
      alert('Failed to delete account. Please try again or contact support.')
    }
  }

  // Realtime
  useEffect(() => {
    const supabase = createClient()
    const ch = supabase.channel('dash_rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sync_logs', filter: `user_id=eq.${userId}` }, (p) => {
        const log = p.new as SyncLog
        setLogs((prev) => [log, ...prev].slice(0, 200))
        setNewLogIds((prev) => new Set([...prev, log.id]))
        setTimeout(() => setNewLogIds((prev) => { const s = new Set(prev); s.delete(log.id); return s }), 2000)
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [userId])

  const connectedCount = PLATFORMS.filter(p => connections.some(c => c.platform === p.id && c.is_active)).length
  const isConnected    = (id: string) => connections.some(c => c.platform === id && c.is_active)
  const getUsername    = (id: string) => connections.find(c => c.platform === id)?.platform_username

  // Health alerts for banner
  const healthAlerts = useMemo(() => {
    const alerts: string[] = []
    for (const p of PLATFORMS) {
      const conn  = connections.find(c => c.platform === p.id)
      const label = getHealthLabel(conn)
      if (conn?.is_active && (label === 'stale' || label === 'silent')) {
        const age = conn.last_webhook_at
          ? `${Math.round((Date.now() - new Date(conn.last_webhook_at).getTime()) / 3600000)}h ago`
          : 'never'
        alerts.push(`${p.label} webhooks last fired ${age}`)
      }
    }
    return alerts
  }, [connections])

  // Filtered logs for Live Feed
  const filteredLogs = useMemo(() => logs.filter(log => {
    if (feedStatus !== 'all' && log.status !== feedStatus) return false
    if (feedPlatform !== 'all' && log.source_platform !== feedPlatform && log.target_platform !== feedPlatform) return false
    if (feedSearch && !log.listing_title?.toLowerCase().includes(feedSearch.toLowerCase())) return false
    return true
  }), [logs, feedStatus, feedPlatform, feedSearch])

  // Global search results
  type SearchResult =
    | { kind: 'nav';   view: View; label: string; Icon: React.ElementType }
    | { kind: 'log';   id: string; title: string; status: string; route: string }
    | { kind: 'price'; id: string; title: string; status: string }

  const searchResults = useMemo<SearchResult[]>(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    const out: SearchResult[] = []
    const allNav = [...NAV, { id: 'settings' as View, label: 'Settings', Icon: Settings }]
    for (const n of allNav) {
      if (n.label.toLowerCase().includes(q)) out.push({ kind: 'nav', view: n.id, label: n.label, Icon: n.Icon })
    }
    let lc = 0
    for (const l of logs) {
      if (lc >= 4) break
      if (l.listing_title?.toLowerCase().includes(q)) {
        out.push({ kind: 'log', id: l.id, title: l.listing_title, status: l.status, route: `${l.source_platform}→${l.target_platform}` })
        lc++
      }
    }
    let pc = 0
    for (const p of priceSyncLogs) {
      if (pc >= 3) break
      if (p.listing_title?.toLowerCase().includes(q)) {
        out.push({ kind: 'price', id: p.id, title: p.listing_title, status: p.status })
        pc++
      }
    }
    return out
  }, [searchQuery, logs, priceSyncLogs])

  const closeSearch = useCallback(() => { setSearchOpen(false); setSearchQuery('') }, [])

  const handleSearchSelect = useCallback((r: SearchResult) => {
    closeSearch()
    if (r.kind === 'nav') { setView(r.view); setSidebarOpen(false) }
    else if (r.kind === 'log') { setView('feed'); setFeedSearch(r.title) }
    else if (r.kind === 'price') { setView('price') }
  }, [closeSearch])

  const handleSearchKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeSearch()
  }, [closeSearch])

  // ⌘K / Ctrl+K to focus search; click outside to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        setSearchOpen(true)
      }
    }
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick) }
  }, [])

  const navigate = (v: View) => { setView(v); setSidebarOpen(false) }

  const handleConnect = (p: typeof PLATFORMS[number]) => {
    if (p.shopify) setShopifyPrompt(true)
    else window.location.href = p.connectUrl
  }
  const handleShopifyConnect = () => {
    if (!shopDomain.trim()) return
    const domain = shopDomain.includes('.myshopify.com') ? shopDomain : `${shopDomain}.myshopify.com`
    window.location.href = `/api/oauth/shopify/start?shop=${domain}`
  }
  const handleDisconnect = async (p: typeof PLATFORMS[number]) => {
    setLoadingPlatform(p.id)
    try { await fetch(p.disconnectUrl, { method: 'POST' }); setConnections(prev => prev.filter(c => c.platform !== p.id)) }
    finally { setLoadingPlatform(null) }
  }

  const STAT_CARDS = [
    { label: 'This month',       value: monthlyCount,                                               icon: <Zap className="w-4 h-4" />,         color: '#c49a3c', view: 'feed' as View },
    { label: 'Success rate',     value: `${stats.successRate}%`,                                    icon: <CheckCircle2 className="w-4 h-4" />, color: '#4a9d6e', view: 'feed' as View },
    { label: 'Avg latency',      value: stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs}ms` : '—',  icon: <TrendingUp className="w-4 h-4" />,   color: '#7a9ec4', view: null },
    { label: 'Doubles prevented',value: stats.doublesSaved,                                         icon: <ShieldCheck className="w-4 h-4" />,  color: '#c97a40', view: null },
  ]

  // ── Sidebar ────────────────────────────────────────────────────────────────

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.05]">
        <Link href="/" className="flex items-center gap-3">
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" className="shrink-0">
            <path d="M8 14L14 20L14 8" stroke="#c97a40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M24 18L18 12L18 24" stroke="#4a9d6e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="16" cy="16" r="2.5" fill="#f0ece6"/>
          </svg>
          <div>
            <p className="text-[16px] font-bold leading-none text-[#f0ece6]">Sold<span className="text-[#c97a40]">Sync</span></p>
            <p className="text-[8px] text-[#3a3530] font-medium tracking-widest mt-0.5">XEQUTIVE TECH</p>
          </div>
        </Link>
      </div>

      {/* Connection status */}
      <div className="px-4 pt-4 pb-1">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium border ${
          connectedCount === PLATFORMS.length
            ? 'border-[#4a9d6e]/25 bg-[#4a9d6e]/8 text-[#4a9d6e]'
            : connectedCount > 0
            ? 'border-[#c49a3c]/25 bg-[#c49a3c]/8 text-[#c49a3c]'
            : 'border-white/[0.06] bg-white/[0.02] text-[#4a4540]'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            connectedCount === PLATFORMS.length ? 'bg-[#4a9d6e] animate-pulse' : connectedCount > 0 ? 'bg-[#c49a3c]' : 'bg-[#3a3530]'
          }`} />
          {connectedCount === PLATFORMS.length ? 'All platforms live' : `${connectedCount}/${PLATFORMS.length} connected`}
        </div>
      </div>

      {/* Monthly syncs mini meter */}
      <div className="px-4 pt-2 pb-3">
        <div className="px-3 py-2.5 rounded-xl bg-[#1a1916] border border-white/[0.05]">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] text-[#3a3530] font-medium">This month</p>
            <p className="text-[10px] font-bold text-[#f0ece6]">{monthlyCount} syncs</p>
          </div>
          <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#c97a40]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((monthlyCount / 100) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-2">
        {NAV.map(({ id, label, Icon }) => {
          const active   = view === id
          const alertDot = id === 'stock' && stockSnapshots.length > 0
          return (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 relative ${
                active
                  ? 'bg-[#c97a40]/10 text-[#c97a40] border border-[#c97a40]/18'
                  : 'text-[#5a5450] hover:text-[#c8c2bb] hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-[#c97a40]" />}
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {alertDot && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c49a3c]" />}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/[0.05] space-y-0.5">
        <button
          onClick={() => navigate('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
            view === 'settings'
              ? 'bg-[#c97a40]/10 text-[#c97a40] border border-[#c97a40]/18'
              : 'text-[#5a5450] hover:text-[#c8c2bb] hover:bg-white/[0.04] border border-transparent'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </button>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#5a5450] hover:text-[#c0554e] hover:bg-[#c0554e]/5 border border-transparent transition-all duration-150">
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  )

  // ── Shell ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#1a1916] text-[#f0ece6] flex">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 fixed left-0 top-0 bottom-0 bg-[#131211] border-r border-white/[0.05] z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} />
            <motion.aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#131211] border-r border-white/[0.05] z-50 md:hidden flex flex-col"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-[#4a4540] hover:text-[#f0ece6] hover:bg-white/[0.06] transition-colors">
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col md:ml-60 min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 border-b border-white/[0.05] bg-[#1a1916]/95 backdrop-blur-xl" style={{ height: 52 }}>
          {/* Mobile menu */}
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg text-[#5a5450] hover:text-[#f0ece6] hover:bg-white/[0.06] transition-colors shrink-0">
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${searchOpen ? 'border-[#c97a40]/35 bg-[#1e1d1b]' : 'border-white/[0.07] bg-[#131211] hover:border-white/[0.12]'}`}>
              <Search className="w-3.5 h-3.5 text-[#3a3530] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={handleSearchKey}
                placeholder="Search logs, navigate, settings…"
                className="bg-transparent text-sm text-[#f0ece6] placeholder:text-[#3a3530] outline-none w-full"
              />
              {searchQuery
                ? <button onClick={closeSearch} className="text-[#3a3530] hover:text-[#7a7268] transition-colors"><X className="w-3.5 h-3.5" /></button>
                : <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-[#2a2826] font-mono border border-white/[0.06] rounded px-1.5 py-0.5 shrink-0">⌘K</kbd>
              }
            </div>

            {/* Results dropdown */}
            <AnimatePresence>
              {searchOpen && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.13 }}
                  className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-white/[0.09] bg-[#141311] shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden z-50"
                >
                  {searchResults.map((r, i) => {
                    if (r.kind === 'nav') return (
                      <button key={i} onClick={() => handleSearchSelect(r)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors border-b border-white/[0.04] last:border-0 text-left group">
                        <div className="w-6 h-6 rounded-lg bg-[#c97a40]/10 border border-[#c97a40]/15 flex items-center justify-center shrink-0">
                          <r.Icon className="w-3 h-3 text-[#c97a40]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#d4cdc7] group-hover:text-[#f0ece6] transition-colors">{r.label}</p>
                          <p className="text-[10px] text-[#3a3530]">Navigate to</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#2a2826] group-hover:text-[#c97a40] transition-colors shrink-0" />
                      </button>
                    )
                    if (r.kind === 'log') return (
                      <button key={i} onClick={() => handleSearchSelect(r)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors border-b border-white/[0.04] last:border-0 text-left group">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'success' ? 'bg-[#4a9d6e]' : r.status === 'failed' ? 'bg-[#c0554e]' : 'bg-[#c49a3c]'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#d4cdc7] truncate group-hover:text-[#f0ece6] transition-colors">{r.title}</p>
                          <p className="text-[10px] text-[#3a3530] font-mono">{r.route}</p>
                        </div>
                        <span className="text-[10px] text-[#3a3530] shrink-0">Sync log</span>
                      </button>
                    )
                    return (
                      <button key={i} onClick={() => handleSearchSelect(r)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors border-b border-white/[0.04] last:border-0 text-left group">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'success' ? 'bg-[#4a9d6e]' : r.status === 'failed' ? 'bg-[#c0554e]' : 'bg-[#c49a3c]'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#d4cdc7] truncate group-hover:text-[#f0ece6] transition-colors">{r.title}</p>
                          <p className="text-[10px] text-[#3a3530]">Price sync</p>
                        </div>
                        <span className="text-[10px] text-[#3a3530] shrink-0">Price</span>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            {logs.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4a9d6e]/8 border border-[#4a9d6e]/15">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4a9d6e] animate-pulse" />
                <span className="text-[10px] text-[#4a9d6e] font-mono">live</span>
              </div>
            )}
            <button onClick={() => navigate('settings')} className="p-2 rounded-lg text-[#5a5450] hover:text-[#f0ece6] hover:bg-white/[0.06] transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Health alert banner */}
        <AnimatePresence>
          {healthAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="border-b border-[#c49a3c]/20 bg-[#c49a3c]/8 overflow-hidden"
            >
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
                <AlertTriangle className="w-3.5 h-3.5 text-[#c49a3c] shrink-0" />
                <p className="text-xs text-[#b8a870] flex-1">{healthAlerts.join(' · ')}</p>
                <button onClick={() => navigate('connections')} className="text-xs text-[#c97a40] hover:underline shrink-0 font-medium">
                  Fix →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full"
            >

              {/* ══ OVERVIEW ══ */}
              {view === 'overview' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#f0ece6]">Command Center</h2>
                    <p className="text-sm text-[#4a4540] mt-0.5">Real-time inventory sync across all your platforms.</p>
                  </div>

                  {/* Onboarding checklist */}
                  {connectedCount < PLATFORMS.length && (
                    <div className="rounded-2xl border border-[#c97a40]/15 bg-[#c97a40]/5 p-5">
                      <p className="text-sm font-semibold text-[#f0ece6] mb-3">
                        Get started — {connectedCount}/{PLATFORMS.length} platforms connected
                      </p>
                      <div className="space-y-2">
                        {PLATFORMS.map(p => {
                          const done = isConnected(p.id)
                          return (
                            <button
                              key={p.id}
                              onClick={() => !done && navigate('connections')}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-left ${
                                done
                                  ? 'border-[#4a9d6e]/20 bg-[#4a9d6e]/5 cursor-default'
                                  : 'border-white/[0.07] bg-[#1a1916] hover:border-white/[0.14] hover:bg-[#1e1d1b]'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                done ? 'bg-[#4a9d6e] border-[#4a9d6e]' : 'border-white/[0.15]'
                              }`}>
                                {done && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span style={{ color: p.hex }}><p.Icon size={14} /></span>
                              <span className="text-sm text-[#b8b0a6]">Connect {p.label}</span>
                              {done
                                ? <span className="ml-auto text-xs text-[#4a9d6e]">Connected</span>
                                : <ArrowRight className="ml-auto w-3.5 h-3.5 text-[#3a3530]" />
                              }
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Stats grid — clickable */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {STAT_CARDS.map((s) => (
                      <div
                        key={s.label}
                        onClick={() => s.view && navigate(s.view)}
                        className={`rounded-xl border border-white/[0.07] bg-[#1e1d1b] p-4 relative overflow-hidden transition-all ${s.view ? 'hover:border-white/[0.12] cursor-pointer hover:bg-[#242220]' : ''}`}
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl -mr-6 -mt-6 opacity-15 pointer-events-none" style={{ backgroundColor: s.color }} />
                        <div className="flex items-center justify-between mb-3 relative z-10">
                          <p className="text-[10px] text-[#4a4540] font-medium uppercase tracking-wide">{s.label}</p>
                          <span style={{ color: s.color }}>{s.icon}</span>
                        </div>
                        <p className="text-2xl font-bold relative z-10 text-[#f0ece6]">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* 7-day chart */}
                  <SyncChart data={dailySyncs} />

                  {/* Platform health */}
                  <SyncHealthPanel connections={connections} />

                  {/* Quick actions */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3a3530] mb-2.5">Quick actions</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'Connections',   v: 'connections' as View, icon: <Plug className="w-4 h-4" />,              c: '#4a9d6e' },
                        { label: 'Manual Delist', v: 'manual' as View,      icon: <MousePointerClick className="w-4 h-4" />, c: '#c97a40' },
                        { label: 'Live Feed',     v: 'feed' as View,         icon: <Terminal className="w-4 h-4" />,           c: '#7a9ec4' },
                        { label: 'Settings',      v: 'settings' as View,     icon: <Settings className="w-4 h-4" />,           c: '#9a7ac4' },
                      ].map(a => (
                        <button key={a.v} onClick={() => navigate(a.v)}
                          className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-[#1e1d1b] px-4 py-3 text-sm font-medium text-[#7a7268] hover:text-[#f0ece6] hover:border-white/[0.13] hover:bg-[#242220] transition-all">
                          <span style={{ color: a.c }}>{a.icon}</span>{a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent activity */}
                  {logs.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3a3530]">Recent activity</p>
                        <button onClick={() => navigate('feed')} className="text-[10px] text-[#4a4540] hover:text-[#c97a40] flex items-center gap-1 transition-colors">
                          View all <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="rounded-xl border border-white/[0.07] bg-[#1e1d1b] overflow-hidden divide-y divide-white/[0.04]">
                        {logs.slice(0, 6).map(log => (
                          <div key={log.id} className="flex items-center gap-3 px-4 py-2.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${log.status === 'success' ? 'bg-[#4a9d6e]' : log.status === 'failed' ? 'bg-[#c0554e]' : 'bg-[#c49a3c]'}`} />
                            <span className="text-xs text-[#7a7268] flex-1 truncate">{log.listing_title}</span>
                            <span className="text-[10px] text-[#3a3530] shrink-0 font-mono capitalize">{log.source_platform}→{log.target_platform}</span>
                            <span className="text-[10px] text-[#2e2c28] shrink-0 font-mono">{new Date(log.created_at).toLocaleTimeString('en-US', { hour12: false })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══ CONNECTIONS ══ */}
              {view === 'connections' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#f0ece6]">Platform Connections</h2>
                    <p className="text-sm text-[#4a4540] mt-0.5">Connect your stores to start syncing inventory in real time.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {PLATFORMS.map(platform => {
                      const connected = isConnected(platform.id)
                      const username  = getUsername(platform.id)
                      const loading   = loadingPlatform === platform.id
                      const conn      = connections.find(c => c.platform === platform.id)
                      const health    = getHealthLabel(conn)
                      const healthColor = health === 'healthy' ? '#4a9d6e' : health === 'stale' ? '#c49a3c' : health === 'silent' ? '#c0554e' : '#3a3530'

                      return (
                        <motion.div key={platform.id} whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                          className={`rounded-2xl border bg-[#1e1d1b] p-6 relative overflow-hidden transition-colors ${
                            connected ? 'border-[#4a9d6e]/15 hover:border-[#4a9d6e]/30' : 'border-white/[0.07] hover:border-white/[0.13]'
                          }`}>
                          <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl -mr-10 -mt-10 opacity-8 pointer-events-none" style={{ backgroundColor: platform.hex }} />

                          <div className="flex items-start justify-between mb-5 relative z-10">
                            <span style={{ color: platform.hex }}><platform.Icon size={platform.iconSize} /></span>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border"
                              style={{ color: healthColor, borderColor: `${healthColor}30`, backgroundColor: `${healthColor}10` }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: healthColor }} />
                              {connected ? (health === 'healthy' ? 'Healthy' : health === 'stale' ? 'Stale' : 'Silent') : 'Not connected'}
                            </div>
                          </div>

                          <h3 className="text-base font-semibold mb-0.5 relative z-10 text-[#f0ece6]">{platform.label}</h3>
                          <p className="text-xs text-[#3a3530] mb-4 relative z-10 h-4 truncate">{username ? `@${username}` : 'Not connected'}</p>

                          {connected ? (
                            <button onClick={() => handleDisconnect(platform)} disabled={loading}
                              className="text-xs text-[#4a4540] hover:text-[#c0554e] transition-colors relative z-10 disabled:opacity-40">
                              {loading ? 'Disconnecting…' : 'Revoke access'}
                            </button>
                          ) : (
                            <button onClick={() => handleConnect(platform)}
                              className="relative z-10 flex items-center gap-1.5 text-sm font-medium px-4 py-2 w-full justify-center rounded-lg bg-[#1a1916] hover:bg-[#242220] border border-white/[0.07] hover:border-white/[0.13] text-[#b8b0a6] hover:text-[#f0ece6] transition-all">
                              Connect <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>

                  {connectedCount >= 2 && (
                    <div className="rounded-xl border border-[#c49a3c]/15 bg-[#c49a3c]/5 p-4 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-[#c49a3c] mt-0.5 shrink-0" />
                      <p className="text-xs text-[#9a9188] leading-relaxed">
                        Keep listing titles at least 90% identical across platforms for reliable auto-delist. Mismatches are logged as <span className="text-[#c49a3c] font-medium">no match</span>.
                      </p>
                    </div>
                  )}

                  <SyncHealthPanel connections={connections} />
                </div>
              )}

              {/* ══ LIVE FEED ══ */}
              {view === 'feed' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#f0ece6]">Live Sync Feed</h2>
                      <p className="text-sm text-[#4a4540] mt-0.5">{logs.length} events recorded · updates in real time</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#1e1d1b] border border-[#4a9d6e]/15">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4a9d6e] animate-pulse" />
                      <span className="text-[10px] text-[#4a9d6e]/80 font-mono">live</span>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.07] bg-[#1e1d1b] flex-1 min-w-[160px]">
                      <Search className="w-3.5 h-3.5 text-[#3a3530] shrink-0" />
                      <input
                        type="text" value={feedSearch} onChange={e => setFeedSearch(e.target.value)}
                        placeholder="Search listing title…"
                        className="bg-transparent text-xs text-[#f0ece6] placeholder:text-[#3a3530] outline-none w-full"
                      />
                      {feedSearch && <button onClick={() => setFeedSearch('')} className="text-[#3a3530] hover:text-[#f0ece6]"><X className="w-3 h-3" /></button>}
                    </div>

                    {/* Status filter */}
                    <div className="flex items-center gap-1 p-1 rounded-xl border border-white/[0.07] bg-[#1e1d1b]">
                      {(['all', 'success', 'failed', 'no_match'] as const).map(s => (
                        <button key={s} onClick={() => setFeedStatus(s)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                            feedStatus === s
                              ? s === 'success' ? 'bg-[#4a9d6e]/15 text-[#4a9d6e]'
                              : s === 'failed' ? 'bg-[#c0554e]/15 text-[#c0554e]'
                              : s === 'no_match' ? 'bg-[#c49a3c]/15 text-[#c49a3c]'
                              : 'bg-[#c97a40]/12 text-[#c97a40]'
                              : 'text-[#4a4540] hover:text-[#b8b0a6]'
                          }`}>
                          {s === 'all' ? 'All' : s === 'success' ? 'Success' : s === 'failed' ? 'Failed' : 'No match'}
                        </button>
                      ))}
                    </div>

                    {/* Platform filter */}
                    <div className="flex items-center gap-1 p-1 rounded-xl border border-white/[0.07] bg-[#1e1d1b]">
                      {['all', 'shopify', 'etsy', 'ebay'].map(p => (
                        <button key={p} onClick={() => setFeedPlatform(p)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors capitalize ${
                            feedPlatform === p ? 'bg-white/[0.07] text-[#f0ece6]' : 'text-[#4a4540] hover:text-[#b8b0a6]'
                          }`}>
                          {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>

                    {(feedStatus !== 'all' || feedPlatform !== 'all' || feedSearch) && (
                      <button onClick={() => { setFeedStatus('all'); setFeedPlatform('all'); setFeedSearch('') }}
                        className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] text-[#c97a40] border border-[#c97a40]/20 bg-[#c97a40]/5 hover:bg-[#c97a40]/10 transition-colors">
                        <Filter className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>

                  {/* Terminal */}
                  <div className="rounded-2xl border border-white/[0.07] bg-[#1e1d1b] overflow-hidden">
                    <div className="px-5 py-3 bg-[#131211] border-b border-white/[0.05] flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#c0554e]/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#c49a3c]/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#4a9d6e]/50" />
                      <span className="ml-4 text-xs text-[#3a3530] font-mono">worker@soldsync ~ sync.log</span>
                      <span className="ml-auto text-[10px] text-[#3a3530] font-mono">{filteredLogs.length}/{logs.length} events</span>
                    </div>

                    <div className="p-4 sm:p-5 h-[calc(100vh-280px)] min-h-[380px] overflow-y-auto font-mono text-xs space-y-0.5">
                      {filteredLogs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3">
                          <Terminal className="w-7 h-7 text-[#2e2c28]" />
                          <span className="text-[#3a3530]">{logs.length === 0 ? 'No events yet — connect platforms to start.' : 'No events match your filters.'}</span>
                        </div>
                      ) : (
                        <AnimatePresence initial={false}>
                          {filteredLogs.map(log => (
                            <motion.div key={log.id}
                              initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
                              className={`flex flex-col sm:flex-row gap-1 sm:gap-3 py-1.5 px-2 rounded border-b border-white/[0.03] last:border-0 ${newLogIds.has(log.id) ? 'bg-[#c97a40]/5' : ''}`}>
                              <span className="text-[#2a2826] shrink-0 w-20">[{new Date(log.created_at).toLocaleTimeString('en-US', { hour12: false })}]</span>
                              <span className={`shrink-0 w-22 font-semibold ${log.status === 'success' ? 'text-[#4a9d6e]' : log.status === 'failed' ? 'text-[#c0554e]' : 'text-[#c49a3c]'}`}>
                                {log.status === 'success' ? '✓ OK' : log.status === 'failed' ? '✗ ERR' : '~ MISS'}
                              </span>
                              <span className="text-[#3a3530] shrink-0 w-28 capitalize">{log.source_platform}→{log.target_platform}</span>
                              <span className="text-[#5a5450] truncate flex-1">
                                "{log.listing_title}" {log.status === 'success' ? `(${log.delist_latency_ms ?? '—'}ms)` : log.error_message ? `— ${log.error_message}` : ''}
                              </span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                      <div className="flex gap-2 items-center pt-2 text-[#2a2826]">
                        <span>❯</span>
                        <span className="w-2 h-3 bg-[#2a2826] animate-pulse inline-block rounded-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ MANUAL DELIST ══ */}
              {view === 'manual' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#f0ece6]">Manual Delist</h2>
                    <p className="text-sm text-[#4a4540] mt-0.5">End a listing across all platforms instantly — no sale needed. Great for local pickups or direct sales.</p>
                  </div>
                  {connectedCount === 0 ? (
                    <div className="rounded-2xl border border-white/[0.07] bg-[#1e1d1b] p-12 text-center">
                      <Plug className="w-8 h-8 text-[#2e2c28] mx-auto mb-3" />
                      <p className="text-sm text-[#4a4540] mb-4">Connect at least one platform first.</p>
                      <button onClick={() => navigate('connections')} className="text-sm text-[#c97a40] hover:underline">Go to Connections →</button>
                    </div>
                  ) : (
                    <ManualSyncPanel connections={connections} />
                  )}
                </div>
              )}

              {/* ══ PRICE SYNC ══ */}
              {view === 'price' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#f0ece6]">Price Sync</h2>
                    <p className="text-sm text-[#4a4540] mt-0.5">Update a price on Shopify — SoldSync propagates it to eBay and Etsy automatically.</p>
                  </div>
                  {!isConnected('shopify') && (
                    <div className="rounded-xl border border-[#c49a3c]/15 bg-[#c49a3c]/5 p-4 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-[#c49a3c] mt-0.5 shrink-0" />
                      <p className="text-xs text-[#9a9188]">Price sync is driven by Shopify webhooks. Connect Shopify to enable this feature.</p>
                    </div>
                  )}
                  {priceSyncLogs.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.07] bg-[#1e1d1b] p-12 text-center">
                      <DollarSign className="w-8 h-8 text-[#2e2c28] mx-auto mb-3" />
                      <p className="text-sm text-[#4a4540] mb-1">No price syncs yet.</p>
                      <p className="text-xs text-[#3a3530]">Update a product price on Shopify and it appears here automatically.</p>
                    </div>
                  ) : (
                    <PriceSyncLog logs={priceSyncLogs} />
                  )}
                </div>
              )}

              {/* ══ LOW STOCK ══ */}
              {view === 'stock' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#f0ece6]">Low Stock Alerts</h2>
                    <p className="text-sm text-[#4a4540] mt-0.5">Items running low that are listed on multiple platforms — the double-sale risk zone.</p>
                  </div>
                  {stockSnapshots.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.07] bg-[#1e1d1b] p-12 text-center">
                      <Package className="w-8 h-8 text-[#2e2c28] mx-auto mb-3" />
                      <p className="text-sm text-[#4a4540] mb-1">No low stock alerts today.</p>
                      <p className="text-xs text-[#3a3530] mb-4">Configure your threshold in Settings → Notifications.</p>
                      <button onClick={() => navigate('settings')} className="text-sm text-[#c97a40] hover:underline">Go to Settings →</button>
                    </div>
                  ) : (
                    <StockAlertsPanel snapshots={stockSnapshots} threshold={lowStockThreshold} />
                  )}
                </div>
              )}

              {/* ══ SETTINGS ══ */}
              {view === 'settings' && (
                <div className="space-y-5 max-w-2xl">
                  <div>
                    <h2 className="text-xl font-bold text-[#f0ece6]">Settings</h2>
                    <p className="text-sm text-[#4a4540] mt-0.5">Manage notifications, billing, and your account.</p>
                  </div>

                  {/* Account card */}
                  <div className="rounded-2xl border border-white/[0.07] bg-[#1e1d1b] overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#c97a40]" />
                      <h3 className="text-sm font-semibold text-[#f0ece6]">Account</h3>
                    </div>
                    <div className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#c97a40]/15 border border-[#c97a40]/25 flex items-center justify-center text-sm font-bold text-[#c97a40] shrink-0">
                        {userEmail?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#f0ece6] truncate">{userEmail}</p>
                        <p className="text-xs text-[#4a4540] mt-0.5">
                          {subscriptionStatus === 'trialing' ? '7-day free trial active' : `Subscription: ${subscriptionStatus}`}
                        </p>
                      </div>
                      <StatusBadge status={subscriptionStatus} />
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="rounded-2xl border border-white/[0.07] bg-[#1e1d1b] overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#c97a40]" />
                      <h3 className="text-sm font-semibold text-[#f0ece6]">Notifications</h3>
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-[#5a5450] mb-4 leading-relaxed">Choose which email alerts you receive. Failure alerts are on by default — your last line of defence against double-sales.</p>
                      <NotificationSettings userId={userId} />
                    </div>
                  </div>

                  {/* Billing */}
                  <div className="rounded-2xl border border-white/[0.07] bg-[#1e1d1b] overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#c97a40]" />
                      <h3 className="text-sm font-semibold text-[#f0ece6]">Billing</h3>
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-[#5a5450] mb-4">Manage your subscription, update your card, or download invoices through the Stripe Customer Portal.</p>
                      <form action="/api/stripe/portal" method="POST">
                        <button type="submit" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-sm font-medium text-[#b8b0a6] hover:text-[#f0ece6] transition-all">
                          <ExternalLink className="w-3.5 h-3.5" /> Open Stripe Portal
                        </button>
                      </form>
                      <p className="text-xs text-[#3a3530] mt-3">Cancellations take effect at the end of the current billing period.</p>
                    </div>
                  </div>

                  {/* Danger zone */}
                  <div className="rounded-2xl border border-[#c0554e]/12 bg-[#1e1d1b] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#c0554e]/10">
                      <h3 className="text-sm font-semibold text-[#c0554e]">Danger Zone</h3>
                    </div>
                    <div className="p-5 space-y-3">
                      <form action="/api/auth/signout" method="POST">
                        <button type="submit" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-[#c0554e]/25 hover:bg-[#c0554e]/5 text-sm font-medium text-[#6a6460] hover:text-[#e8857e] transition-all">
                          <LogOut className="w-3.5 h-3.5" /> Sign out of SoldSync
                        </button>
                      </form>

                      <div className="border-t border-white/[0.05] pt-3">
                        {!deleteConfirm ? (
                          <div>
                            <p className="text-xs text-[#5a5450] mb-3 leading-relaxed">
                              Permanently delete your account and all data — connections, sync logs, price sync history. This cannot be undone. Cancel your subscription first via the Billing portal above.
                            </p>
                            <button
                              onClick={() => setDeleteConfirm(true)}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#c0554e]/20 bg-[#c0554e]/5 hover:bg-[#c0554e]/10 text-sm font-medium text-[#c0554e]/70 hover:text-[#c0554e] transition-all"
                            >
                              Delete account
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-[#c0554e]/25 bg-[#c0554e]/5 p-4 space-y-3">
                            <p className="text-xs text-[#e8857e] font-medium">This will permanently delete everything. Type <span className="font-mono font-bold">DELETE</span> to confirm.</p>
                            <input
                              type="text"
                              value={deleteInput}
                              onChange={e => setDeleteInput(e.target.value)}
                              placeholder="Type DELETE"
                              className="w-full bg-[#141311] border border-[#c0554e]/25 rounded-lg px-3 py-2 text-sm text-[#f0ece6] placeholder:text-[#3a3530] outline-none focus:border-[#c0554e]/50"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setDeleteConfirm(false); setDeleteInput('') }}
                                className="flex-1 py-2 rounded-lg border border-white/[0.07] text-xs text-[#5a5450] hover:text-[#b8b0a6] hover:bg-white/[0.03] transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleDeleteAccount}
                                disabled={deleteInput !== 'DELETE' || deleting}
                                className="flex-1 py-2 rounded-lg bg-[#c0554e] hover:bg-[#d0645e] text-xs font-semibold text-white transition-colors disabled:opacity-40"
                              >
                                {deleting ? 'Deleting…' : 'Delete forever'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Shopify modal */}
      <AnimatePresence>
        {shopifyPrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShopifyPrompt(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              className="rounded-2xl border border-white/[0.09] bg-[#1e1d1b] p-8 w-full max-w-sm shadow-[0_8px_48px_rgba(0,0,0,0.6)]"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-5">
                <ShopifyLogo size={26} />
                <div>
                  <h3 className="text-base font-semibold text-[#f0ece6]">Connect Shopify</h3>
                  <p className="text-xs text-[#4a4540]">Enter your store domain</p>
                </div>
              </div>
              <div className="flex items-center rounded-xl border border-white/[0.09] bg-[#131211] overflow-hidden mb-4">
                <input autoFocus type="text" value={shopDomain} onChange={e => setShopDomain(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleShopifyConnect()}
                  placeholder="mystore" className="flex-1 bg-transparent px-4 py-3 text-sm text-[#f0ece6] placeholder:text-[#2a2826] outline-none" />
                <span className="text-sm text-[#3a3530] pr-4 shrink-0">.myshopify.com</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShopifyPrompt(false)} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-[#6a6460] hover:text-[#b8b0a6] hover:bg-white/[0.03] transition-colors">Cancel</button>
                <button onClick={handleShopifyConnect} disabled={!shopDomain.trim()} className="flex-1 py-2.5 rounded-xl bg-[#c97a40] hover:bg-[#b86c34] text-sm font-medium text-white transition-colors disabled:opacity-40">Connect</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
