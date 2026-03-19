'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

type Phase = 'idle' | 'sale' | 'syncing' | 'complete'

// Cycling product photos — different resale items each loop
const PRODUCTS = [
  { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=180&fit=crop&crop=center', name: 'Nike Air Max 90' },
  { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=180&fit=crop&crop=center', name: 'Premium Watch' },
  { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=180&fit=crop&crop=center', name: 'Leather Bag' },
  { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=180&fit=crop&crop=center', name: 'Leather Jacket' },
  { url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=180&fit=crop&crop=center', name: 'Sunglasses' },
  { url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&h=180&fit=crop&crop=center', name: 'Perfume' },
]

// ── Layout (px) ───────────────────────────────────────────────────────────────
const W = 440, H = 468
const CW = 140, CH = 152        // card: 96px image + 56px info
const SHOPIFY_X = 10,  SHOPIFY_Y = 4
const EBAY_X    = 290, EBAY_Y    = 4
const ETSY_X    = 150, ETSY_Y    = 292

// Connection points (card edge mid-points)
const SC = { x: SHOPIFY_X + CW / 2, y: SHOPIFY_Y + CH }   // (80,  156)
const EC = { x: EBAY_X    + CW / 2, y: EBAY_Y    + CH }   // (360, 156)
const ET = { x: ETSY_X    + CW / 2, y: ETSY_Y         }   // (220, 292)

// SoldSync node
const NODE_W = 120, NODE_H = 32
const NODE_X  = (W - NODE_W) / 2                           // 160
const NODE_Y  = 198
const NODE_CX = NODE_X + NODE_W / 2                        // 220
// node top-centre = (220, 198)  node bottom-centre = (220, 230)

// Bézier curves — arc from central node out to cards
const BY = (SC.y + NODE_Y) / 2                             // 177
const PATH_SHOPIFY = `M${NODE_CX},${NODE_Y} C${NODE_CX},${BY} ${SC.x},${BY} ${SC.x},${SC.y}`
const PATH_EBAY    = `M${NODE_CX},${NODE_Y} C${NODE_CX},${BY} ${EC.x},${BY} ${EC.x},${EC.y}`
const PATH_ETSY    = `M${ET.x},${ET.y} L${NODE_CX},${NODE_Y + NODE_H}`

// ── AnimPath ──────────────────────────────────────────────────────────────────

function AnimPath({
  d,
  active,
  complete,
  delay = 0,
}: {
  d: string
  active: boolean
  complete: boolean
  delay?: number
}) {
  const stroke = complete ? '#c0554e' : '#c97a40'
  return (
    <>
      {/* dim static track */}
      <path d={d} stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />

      <AnimatePresence>
        {active && (
          <motion.path
            key="line"
            d={d}
            stroke={stroke}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.5, ease: 'easeOut' as const, delay }}
          />
        )}
      </AnimatePresence>

      {/* travelling dot */}
      <AnimatePresence>
        {active && !complete && (
          <motion.circle
            key="dot"
            r="3.5"
            fill={stroke}
            filter="url(#glow)"
            initial={{ offsetDistance: '0%' } as never}
            animate={{ offsetDistance: '100%' } as never}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' as const, delay }}
            style={{ offsetPath: `path("${d}")` } as never}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ── Platform data ─────────────────────────────────────────────────────────────

const PLAT = {
  shopify: { label: 'Shopify', price: '$199', color: '#6da84a' },
  ebay:    { label: 'eBay',    price: '$189', color: '#5b8fc4' },
  etsy:    { label: 'Etsy',    price: '$195', color: '#c97a40' },
}

// ── Platform card ─────────────────────────────────────────────────────────────

function PlatCard({
  platform, x, y, status, isSaleSource = false, saleActive = false, product,
}: {
  platform: keyof typeof PLAT
  x: number; y: number
  status: 'active' | 'delisting' | 'ended'
  isSaleSource?: boolean; saleActive?: boolean
  product: typeof PRODUCTS[number]
}) {
  const p = PLAT[platform]
  const ended    = status === 'ended'    && !isSaleSource
  const delisting = status === 'delisting' && !isSaleSource

  return (
    <motion.div
      style={{ position: 'absolute', left: x, top: y, width: CW, zIndex: 5 }}
      animate={{ opacity: ended ? 0.55 : 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        animate={{
          borderColor: saleActive && isSaleSource
            ? p.color + '70'
            : ended     ? '#c0554e35'
            : delisting ? '#c97a4038'
            : 'rgba(255,255,255,0.09)',
          boxShadow: saleActive && isSaleSource
            ? `0 0 28px -6px ${p.color}55, 0 0 0 1px ${p.color}25`
            : ended ? '0 0 0 1px #c0554e20'
            : 'none',
        }}
        transition={{ duration: 0.35 }}
        className="rounded-xl overflow-hidden border bg-[#1e1d1b]"
        style={{ borderColor: 'rgba(255,255,255,0.09)' }}
      >
        {/* Platform colour bar */}
        <div className="h-[3px]" style={{ backgroundColor: p.color + '60' }} />

        {/* Product image */}
        <div className="relative overflow-hidden" style={{ height: 96 }}>
          <Image
            src={product.url}
            alt={product.name}
            fill
            className="object-cover"
            unoptimized
          />
          {/* ended overlay */}
          <AnimatePresence>
            {ended && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-[#161514]/75 flex items-center justify-center"
              >
                <div className="w-7 h-7 rounded-full bg-[#c0554e]/20 border border-[#c0554e]/40 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2L2 10" stroke="#c0554e" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* SOLD badge */}
          <AnimatePresence>
            {saleActive && isSaleSource && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: `${p.color}1a`, backdropFilter: 'blur(2px)' }}
              >
                <span
                  className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md"
                  style={{ color: p.color, background: `${p.color}25`, border: `1.5px solid ${p.color}60` }}
                >
                  SOLD
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info row */}
        <div className="px-2.5 py-2">
          <p className="text-[10px] font-semibold text-[#b8b0a6] truncate leading-none mb-1.5">
            {product.name}
          </p>
          <div className="flex items-center justify-between gap-1">
            <span className="text-[12px] font-bold" style={{ color: ended ? '#3a3530' : '#f0ece6' }}>
              {p.price}
            </span>
            <motion.span
              animate={{
                backgroundColor: ended     ? '#c0554e12' : delisting ? '#c97a4012' : p.color + '14',
                color:           ended     ? '#c0554e'   : delisting ? '#c97a40'   : p.color,
                borderColor:     ended     ? '#c0554e30' : delisting ? '#c97a4030' : p.color + '30',
              }}
              transition={{ duration: 0.25 }}
              className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border whitespace-nowrap"
            >
              {ended ? 'Ended' : delisting ? 'Delisting…' : p.label}
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Live ping dot */}
      {status === 'active' && !saleActive && (
        <div
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#1a1916]"
          style={{ backgroundColor: p.color }}
        >
          <span className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ backgroundColor: p.color }} />
        </div>
      )}
    </motion.div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SyncFlowDemo() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [productIdx, setProductIdx] = useState(0)
  const cycleRef = useRef(0)

  useEffect(() => {
    let mounted = true
    function run() {
      if (!mounted) return
      // Advance product every cycle
      cycleRef.current += 1
      setProductIdx(cycleRef.current % PRODUCTS.length)
      setPhase('idle')
      setTimeout(() => mounted && setPhase('sale'),     2400)
      setTimeout(() => mounted && setPhase('syncing'),  3600)
      setTimeout(() => mounted && setPhase('complete'), 5200)
      setTimeout(run, 8500)
    }
    const t = setTimeout(run, 1000)
    return () => { mounted = false; clearTimeout(t) }
  }, [])

  const shopifyStatus = phase === 'complete' ? 'ended' : phase === 'syncing' ? 'delisting' : 'active'
  const ebayStatus    = phase === 'complete' ? 'ended' : phase === 'syncing' ? 'delisting' : 'active'
  const beamActive    = phase === 'syncing' || phase === 'complete'
  const product       = PRODUCTS[productIdx]

  return (
    <div className="select-none" style={{ position: 'relative', width: W, height: H }}>

      {/* ── SVG layer ─────────────────────────────────────────────────── */}
      <svg
        width={W} height={H} viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Static endpoint connectors */}
        {[SC, EC].map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="rgba(255,255,255,0.08)" />
        ))}
        <circle cx={ET.x} cy={ET.y} r="3" fill="rgba(255,255,255,0.08)" />
        <circle cx={NODE_CX} cy={NODE_Y} r="3" fill="rgba(255,255,255,0.08)" />

        {/* Etsy → Node (sale detection, fires first) */}
        <AnimPath d={PATH_ETSY}    active={beamActive} complete={phase==='complete'} delay={0} />
        {/* Node → Shopify (delist, slight delay) */}
        <AnimPath d={PATH_SHOPIFY} active={beamActive} complete={phase==='complete'} delay={0.3} />
        {/* Node → eBay (delist, slight delay) */}
        <AnimPath d={PATH_EBAY}    active={beamActive} complete={phase==='complete'} delay={0.4} />

        {/* Animated connector dots at endpoints when active */}
        <AnimatePresence>
          {beamActive && (
            <>
              {[SC, EC].map((pt, i) => (
                <motion.circle
                  key={`ep-${i}`}
                  cx={pt.x} cy={pt.y} r="3.5"
                  fill={phase === 'complete' ? '#c0554e' : '#c97a40'}
                  filter="url(#glow)"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i === 0 ? 0.3 : 0.4 }}
                />
              ))}
              <motion.circle
                cx={ET.x} cy={ET.y} r="3.5"
                fill="#c97a40"
                filter="url(#glow)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              />
            </>
          )}
        </AnimatePresence>
      </svg>

      {/* ── Platform cards ────────────────────────────────────────────── */}
      <PlatCard platform="shopify" x={SHOPIFY_X} y={SHOPIFY_Y}
        status={shopifyStatus as 'active'|'delisting'|'ended'} product={product} />
      <PlatCard platform="ebay"    x={EBAY_X}    y={EBAY_Y}
        status={ebayStatus as 'active'|'delisting'|'ended'} product={product} />
      <PlatCard platform="etsy"    x={ETSY_X}    y={ETSY_Y}
        status="active" isSaleSource product={product}
        saleActive={phase === 'sale' || phase === 'syncing' || phase === 'complete'} />

      {/* ── SoldSync hub node ─────────────────────────────────────────── */}
      <motion.div
        style={{ position: 'absolute', left: NODE_X, top: NODE_Y, width: NODE_W, height: NODE_H, zIndex: 20 }}
        animate={{
          borderColor:     beamActive ? 'rgba(201,122,64,0.55)' : 'rgba(255,255,255,0.09)',
          backgroundColor: beamActive ? 'rgba(201,122,64,0.10)' : 'rgba(20,19,17,0.96)',
          boxShadow:       phase === 'syncing' ? '0 0 24px -4px rgba(201,122,64,0.55), 0 0 0 1px rgba(201,122,64,0.2)' : 'none',
        }}
        transition={{ duration: 0.3 }}
        className="rounded-full border flex items-center justify-center gap-2 backdrop-blur-sm"
      >
        <motion.span
          animate={{ backgroundColor: beamActive || phase === 'sale' ? '#c97a40' : '#3a3530' }}
          transition={{ duration: 0.2 }}
          className="w-1.5 h-1.5 rounded-full shrink-0"
        />
        <span className="text-[11px] font-semibold text-[#8a8278] tracking-wide">SoldSync</span>
        <AnimatePresence mode="wait">
          {phase === 'idle'     && <motion.span key="i" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-[9px] text-[#4a4540]">watching</motion.span>}
          {phase === 'sale'     && <motion.span key="s" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-[9px] text-[#c97a40] font-semibold">sale!</motion.span>}
          {phase === 'syncing'  && <motion.span key="y" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-[9px] text-[#c97a40]">syncing…</motion.span>}
          {phase === 'complete' && <motion.span key="c" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-[9px] text-[#4a9d6e] font-semibold">done ✓</motion.span>}
        </AnimatePresence>
      </motion.div>

      {/* ── Status badge — between hub node and Etsy card ─────────────── */}
      <div style={{ position: 'absolute', top: NODE_Y + NODE_H + 12, left: 0, right: 0, zIndex: 15 }} className="flex justify-center">
        <motion.div
          animate={{
            borderColor: phase === 'complete' ? 'rgba(201,122,64,0.45)' : 'rgba(255,255,255,0.06)',
            backgroundColor: phase === 'complete' ? 'rgba(201,122,64,0.09)' : 'rgba(24,23,20,0.90)',
            boxShadow: phase === 'complete' ? '0 0 18px -4px rgba(201,122,64,0.35)' : 'none',
          }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-sm"
        >
          <motion.span
            animate={{
              backgroundColor: phase === 'complete' ? '#c97a40' : phase === 'sale' || phase === 'syncing' ? '#c97a40' : '#3a3530',
              scale: phase === 'complete' ? [1, 1.4, 1] : 1,
            }}
            transition={{ duration: phase === 'complete' ? 0.4 : 0.2 }}
            className="w-1.5 h-1.5 rounded-full shrink-0"
          />
          <AnimatePresence mode="wait">
            {phase === 'complete'
              ? <motion.span key="d" initial={{opacity:0,y:3}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-[11px] font-semibold text-[#c97a40]">No double-sale — done in &lt;3s</motion.span>
              : phase === 'sale' || phase === 'syncing'
              ? <motion.span key="s" initial={{opacity:0,y:3}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-[11px] text-[#c97a40]/80">Syncing across platforms…</motion.span>
              : <motion.span key="w" initial={{opacity:0,y:3}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="text-[11px] text-[#4a4540]">Monitoring 3 platforms in real time</motion.span>
            }
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  )
}
