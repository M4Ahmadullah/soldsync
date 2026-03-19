'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Check, AlertTriangle, TrendingDown } from 'lucide-react'
import { ShopifyLogo, EbayLogo, EtsyLogo, PLATFORM_CONFIG } from './PlatformLogos'

/* ── High-quality product photos (warm / gold tones to match theme) ────── */
const PRODUCTS = [
  { url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=400&fit=crop&crop=center', name: 'Nike Air Force 1', price: 189, sku: 'AF1-WHT-GLD' },
  { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=400&fit=crop&crop=center', name: 'Leather Messenger Bag', price: 245, sku: 'BAG-LTHR-TAN' },
  { url: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&h=400&fit=crop&crop=center', name: 'Vintage Gold Watch', price: 349, sku: 'WATCH-VTG-GLD' },
  { url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=400&fit=crop&crop=center', name: 'Jordan 1 Retro High', price: 275, sku: 'JRD1-RETRO-BLK' },
]

const FEATURE_LABELS = ['Platform Health', 'Low Stock Alerts', 'Price Sync', 'Manual Delist']

export default function FeatureShowcase() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % 4), 8000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="w-full">
      {/* Feature nav */}
      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        {FEATURE_LABELS.map((label, idx) => (
          <button
            key={label}
            onClick={() => setActive(idx)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              active === idx
                ? 'bg-[#c97a40] text-white shadow-lg shadow-[#c97a40]/25'
                : 'bg-white/[0.04] text-[#5a5450] hover:text-[#b8b0a6] hover:bg-white/[0.07]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {active === 0 && <HealthView key="h" />}
        {active === 1 && <StockView key="s" />}
        {active === 2 && <PriceView key="p" />}
        {active === 3 && <DelistView key="d" />}
      </AnimatePresence>
    </div>
  )
}

/* ── Shared wrapper ───────────────────────────────────────────────────── */
function ViewWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl bg-[#1e1d1b] border border-white/[0.06] overflow-hidden"
    >
      {children}
    </motion.div>
  )
}

/* ── Platform row ─────────────────────────────────────────────────────── */
function PlatformRow({ platform, status, sub }: {
  platform: keyof typeof PLATFORM_CONFIG
  status: 'healthy' | 'stale' | 'silent'
  sub: string
}) {
  const p = PLATFORM_CONFIG[platform]
  const color = status === 'healthy' ? '#4a9d6e' : status === 'stale' ? '#c49a3c' : '#c0554e'
  const label = status === 'healthy' ? 'Active' : status === 'stale' ? 'Stale' : 'Silent'
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="shrink-0">
        <p.Logo size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#e8e4de]">{p.label}</p>
        <p className="text-[11px] text-[#4a4540]">{sub}</p>
      </div>
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex items-center gap-1.5"
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-semibold" style={{ color }}>{label}</span>
      </motion.div>
    </div>
  )
}

/* ── Platform sync row (for price/delist views) ───────────────────────── */
function PlatformSyncRow({ platform, detail, delay }: {
  platform: keyof typeof PLATFORM_CONFIG
  detail: string
  delay: number
}) {
  const p = PLATFORM_CONFIG[platform]
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="rounded-lg bg-[#161514] border border-white/[0.04] p-3.5 flex items-center gap-4"
    >
      <div className="shrink-0">
        <p.Logo size={18} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#e8e4de]">{p.label}</p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
          className="text-[11px] text-[#4a9d6e]"
        >{detail}</motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.5 }}
        className="w-6 h-6 rounded-full bg-[#4a9d6e] flex items-center justify-center"
      >
        <Check className="w-3.5 h-3.5 text-white" />
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE 1 — Platform Health
   ═══════════════════════════════════════════════════════════════════════════ */
function HealthView() {
  return (
    <ViewWrap>
      <div className="grid lg:grid-cols-[1fr_1.2fr] divide-y lg:divide-y-0 lg:divide-x divide-white/[0.04]">
        {/* Left — platform status */}
        <div className="p-6">
          <p className="text-[10px] font-bold text-[#c97a40] uppercase tracking-widest mb-1">Live Status</p>
          <h3 className="text-lg font-bold text-[#f0ece6] mb-4">Platform Health</h3>

          <div className="divide-y divide-white/[0.04]">
            <PlatformRow platform="shopify" status="healthy" sub="Last webhook 2 min ago" />
            <PlatformRow platform="ebay" status="stale" sub="Last webhook 6 hours ago" />
            <PlatformRow platform="etsy" status="healthy" sub="Last webhook 30 min ago" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 rounded-lg bg-[#c49a3c]/8 p-3 flex gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 text-[#c49a3c] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#c49a3c]/90 leading-relaxed">
              eBay connection stale. Watchdog will auto-reconnect at 03:00 UTC.
            </p>
          </motion.div>
        </div>

        {/* Right — real product card showing webhook data */}
        <div className="p-6">
          <p className="text-[10px] font-bold text-[#4a9d6e] uppercase tracking-widest mb-3">Latest Webhook</p>
          <div className="rounded-xl overflow-hidden border border-white/[0.04]">
            <div className="relative h-48">
              <Image src={PRODUCTS[0].url} alt={PRODUCTS[0].name} fill className="object-cover" unoptimized />
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-bold bg-[#4a9d6e] text-white px-2.5 py-1 rounded-md shadow-lg">SALE DETECTED</span>
              </div>
            </div>
            <div className="p-4 bg-[#161514]">
              <p className="text-sm font-semibold text-[#e8e4de] mb-1">{PRODUCTS[0].name}</p>
              <p className="text-xs text-[#4a4540] mb-3">${PRODUCTS[0].price}.00 &middot; via Shopify</p>
              <div className="flex gap-1.5">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                  className="h-1.5 rounded-full bg-[#4a9d6e] block"
                />
              </div>
              <p className="text-[11px] text-[#4a9d6e] mt-2 font-medium">eBay + Etsy delisted in 2.1s</p>
            </div>
          </div>
        </div>
      </div>
    </ViewWrap>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE 2 — Low Stock Alerts
   ═══════════════════════════════════════════════════════════════════════════ */
function StockView() {
  return (
    <ViewWrap>
      <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.04]">
        {/* Product 1 — Critical */}
        <div className="p-6">
          <div className="rounded-xl overflow-hidden border border-[#c0554e]/15 mb-3">
            <div className="relative h-48">
              <Image src={PRODUCTS[3].url} alt={PRODUCTS[3].name} fill className="object-cover" unoptimized />
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-3 right-3"
              >
                <span className="text-[10px] font-bold bg-[#c0554e] text-white px-2.5 py-1 rounded-md shadow-lg">1 LEFT</span>
              </motion.div>
            </div>
            <div className="p-4 bg-[#161514]">
              <p className="text-sm font-semibold text-[#e8e4de]">{PRODUCTS[3].name}</p>
              <p className="text-xs text-[#4a4540] mb-3">{PRODUCTS[3].sku} &middot; ${PRODUCTS[3].price}</p>
              <div className="flex gap-1.5">
                {(['shopify', 'ebay', 'etsy'] as const).map((pl) => {
                  const p = PLATFORM_CONFIG[pl]
                  const qty = pl === 'shopify' ? 1 : 0
                  return (
                    <span key={pl} className="text-[9px] font-medium px-2 py-1 rounded-md flex items-center gap-1"
                      style={{
                        backgroundColor: qty > 0 ? p.color + '15' : 'rgba(255,255,255,0.02)',
                        color: qty > 0 ? p.color : '#3a3530',
                      }}>
                      {p.label}: {qty}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[11px] font-bold text-[#c0554e] flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Critical — on 3 platforms with 1 unit
          </motion.p>
        </div>

        {/* Product 2 — Warning */}
        <div className="p-6">
          <div className="rounded-xl overflow-hidden border border-[#c49a3c]/15 mb-3">
            <div className="relative h-48">
              <Image src={PRODUCTS[1].url} alt={PRODUCTS[1].name} fill className="object-cover" unoptimized />
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                className="absolute top-3 right-3"
              >
                <span className="text-[10px] font-bold bg-[#c49a3c] text-white px-2.5 py-1 rounded-md shadow-lg">2 LEFT</span>
              </motion.div>
            </div>
            <div className="p-4 bg-[#161514]">
              <p className="text-sm font-semibold text-[#e8e4de]">{PRODUCTS[1].name}</p>
              <p className="text-xs text-[#4a4540] mb-3">{PRODUCTS[1].sku} &middot; ${PRODUCTS[1].price}</p>
              <div className="flex gap-1.5">
                {(['shopify', 'ebay', 'etsy'] as const).map((pl) => {
                  const p = PLATFORM_CONFIG[pl]
                  const qty = pl === 'ebay' ? 0 : 1
                  return (
                    <span key={pl} className="text-[9px] font-medium px-2 py-1 rounded-md flex items-center gap-1"
                      style={{
                        backgroundColor: qty > 0 ? p.color + '15' : 'rgba(255,255,255,0.02)',
                        color: qty > 0 ? p.color : '#3a3530',
                      }}>
                      {p.label}: {qty}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            className="text-[11px] font-bold text-[#c49a3c] flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Warning — 2 units across 2 platforms
          </motion.p>
        </div>
      </div>
    </ViewWrap>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE 3 — Price Sync
   ═══════════════════════════════════════════════════════════════════════════ */
function PriceView() {
  const product = PRODUCTS[2]
  const oldPrice = product.price
  const newPrice = 299

  return (
    <ViewWrap>
      <div className="grid lg:grid-cols-[1.2fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-white/[0.04]">
        {/* Left — product with price change */}
        <div className="p-6">
          <p className="text-[10px] font-bold text-[#c97a40] uppercase tracking-widest mb-3">Price Updated on Shopify</p>
          <div className="rounded-xl overflow-hidden border border-white/[0.04]">
            <div className="relative h-48">
              <Image src={product.url} alt={product.name} fill className="object-cover" unoptimized />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-[#161514]/90 backdrop-blur-sm rounded-lg px-4 py-2.5"
              >
                <span className="text-sm text-[#5a5450] line-through">${oldPrice}</span>
                <motion.span
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-lg font-bold text-[#4a9d6e]"
                >${newPrice}</motion.span>
              </motion.div>
            </div>
            <div className="p-4 bg-[#161514]">
              <p className="text-sm font-semibold text-[#e8e4de]">{product.name}</p>
              <p className="text-xs text-[#4a4540]">{product.sku}</p>
            </div>
          </div>
        </div>

        {/* Right — sync targets */}
        <div className="p-6">
          <p className="text-[10px] font-bold text-[#4a9d6e] uppercase tracking-widest mb-3">Syncing to Platforms</p>

          <div className="space-y-2.5">
            <PlatformSyncRow platform="ebay" detail={`$${oldPrice} → $${newPrice}`} delay={0.5} />
            <PlatformSyncRow platform="etsy" detail={`$${oldPrice} → $${newPrice}`} delay={0.9} />
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="flex gap-3 mt-5"
          >
            <div className="flex-1 rounded-lg bg-[#4a9d6e]/8 py-3 text-center">
              <p className="text-base font-bold text-[#4a9d6e]">1.8s</p>
              <p className="text-[10px] text-[#4a4540]">Sync time</p>
            </div>
            <div className="flex-1 rounded-lg bg-[#c97a40]/8 py-3 text-center">
              <p className="text-base font-bold text-[#c97a40]">2/2</p>
              <p className="text-[10px] text-[#4a4540]">Updated</p>
            </div>
          </motion.div>
        </div>
      </div>
    </ViewWrap>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE 4 — Manual Delist
   ═══════════════════════════════════════════════════════════════════════════ */
function DelistView() {
  const product = PRODUCTS[0]

  return (
    <ViewWrap>
      <div className="grid lg:grid-cols-[1fr_1.3fr] divide-y lg:divide-y-0 lg:divide-x divide-white/[0.04]">
        {/* Left — product */}
        <div className="p-6">
          <p className="text-[10px] font-bold text-[#c0554e] uppercase tracking-widest mb-3">Delist Everywhere</p>
          <div className="rounded-xl overflow-hidden border border-white/[0.04]">
            <div className="relative h-48">
              <Image src={product.url} alt={product.name} fill className="object-cover" unoptimized />
            </div>
            <div className="p-4 bg-[#161514]">
              <p className="text-sm font-semibold text-[#e8e4de]">{product.name}</p>
              <p className="text-xs text-[#4a4540] mb-1">{product.sku} &middot; ${product.price}</p>
              <p className="text-[11px] text-[#5a5450]">Sold locally via direct sale</p>
            </div>
          </div>
        </div>

        {/* Right — delist result */}
        <div className="p-6">
          <p className="text-[10px] font-bold text-[#7a7268] uppercase tracking-widest mb-3">Delist Results</p>

          <div className="space-y-2.5 mb-5">
            <PlatformSyncRow platform="shopify" detail="Listing ended" delay={0.4} />
            <PlatformSyncRow platform="ebay" detail="Listing ended" delay={0.7} />
            <PlatformSyncRow platform="etsy" detail="Listing ended" delay={1.0} />
          </div>

          {/* Success */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="rounded-lg bg-[#4a9d6e]/8 p-3.5 flex items-start gap-2.5"
          >
            <Check className="w-4 h-4 text-[#4a9d6e] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#4a9d6e]">Delisted from 3 platforms in 2.1s</p>
              <p className="text-[11px] text-[#4a9d6e]/60 mt-0.5">Logged to sync history as manual delist</p>
            </div>
          </motion.div>
        </div>
      </div>
    </ViewWrap>
  )
}
