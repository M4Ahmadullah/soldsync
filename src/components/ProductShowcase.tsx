'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

export default function ProductShowcase() {
  const [isSold, setIsSold] = useState(false)
  const [platform, setPlatform] = useState<'etsy' | 'ebay'>('etsy')

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSold(true)
      setTimeout(() => {
        setPlatform((p) => (p === 'etsy' ? 'ebay' : 'etsy'))
        setIsSold(false)
      }, 2500)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full max-w-sm mx-auto h-[420px] flex items-center justify-center select-none">
      {/* Glow */}
      <div className="absolute inset-0 bg-[#6366F1]/10 rounded-3xl blur-3xl" />

      {/* Card */}
      <AnimatePresence>
        {!isSold && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-64 bg-[#18181A] border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
          >
            {/* Image placeholder */}
            <div className="w-full h-36 rounded-xl bg-zinc-800 mb-4 overflow-hidden flex items-center justify-center">
              <div className="text-4xl">🧥</div>
            </div>
            <p className="text-zinc-100 font-semibold text-sm mb-1">Vintage Leather Jacket</p>
            <p className="text-zinc-500 text-xs mb-3">SKU: VINT-01</p>
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold">$199</span>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: platform === 'etsy' ? '#F1641E22' : '#0064D222',
                  color: platform === 'etsy' ? '#F1641E' : '#0064D2',
                }}
              >
                {platform === 'etsy' ? 'Etsy' : 'eBay'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sold event */}
      <AnimatePresence>
        {isSold && (
          <motion.div
            key="sold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute z-20 flex flex-col items-center gap-3"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-emerald-400 font-semibold text-sm">Sale detected!</p>
              <p className="text-zinc-500 text-xs mt-1">Auto-delisting on other platforms…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status bar */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#18181A]/80 border border-white/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
          <span className="text-xs text-zinc-400">Live across all platforms</span>
        </div>
      </div>
    </div>
  )
}
