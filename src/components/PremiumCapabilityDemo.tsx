'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Check, AlertTriangle, Zap } from 'lucide-react'

// Animated product data that updates
const PRODUCT_SEQUENCE = [
  {
    id: 1,
    title: 'Nike Air Max 90 White',
    price: 89.99,
    newPrice: 79.99,
    image: '🏃',
    platforms: ['Shopify', 'eBay', 'Etsy'],
    quantity: 1,
    status: 'low-stock',
  },
  {
    id: 2,
    title: 'Vintage Leather Jacket',
    price: 149.99,
    newPrice: 129.99,
    image: '🧥',
    platforms: ['Shopify', 'Etsy'],
    quantity: 2,
    status: 'warning',
  },
]

const PLATFORM_HEALTH_SEQUENCE = [
  { platform: 'Shopify', status: 'healthy', time: '2m', dot: '#4a9d6e' },
  { platform: 'eBay', status: 'stale', time: '6h', dot: '#c49a3c' },
  { platform: 'Etsy', status: 'healthy', time: '30m', dot: '#4a9d6e' },
]

export default function PremiumCapabilityDemo() {
  const [activeProduct, setActiveProduct] = useState(0)
  const [priceAnimating, setPriceAnimating] = useState(false)
  const [syncComplete, setSyncComplete] = useState(false)

  useEffect(() => {
    const productInterval = setInterval(() => {
      setActiveProduct((prev) => (prev + 1) % PRODUCT_SEQUENCE.length)
      setPriceAnimating(false)
      setSyncComplete(false)
    }, 8000)

    return () => clearInterval(productInterval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setPriceAnimating(true), 500)
    return () => clearTimeout(timer)
  }, [activeProduct])

  useEffect(() => {
    const timer = setTimeout(() => setSyncComplete(true), 2500)
    return () => clearTimeout(timer)
  }, [priceAnimating])

  const product = PRODUCT_SEQUENCE[activeProduct]

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* ── LEFT: HEALTH MONITORING DASHBOARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-white/[0.08] bg-[#1a1916] overflow-hidden shadow-2xl"
      >
        {/* Realistic browser-like header */}
        <div className="bg-[#141312] border-b border-white/[0.05] px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#c0554e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#c49a3c]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#4a9d6e]" />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#1a1916] rounded-md px-3 py-1.5 border border-white/[0.03]">
            <div className="w-1 h-1 rounded-full bg-[#c97a40]/40" />
            <span className="text-[9px] font-mono text-[#4a4540]">soldsync.io/monitor</span>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-6">
          {/* Status Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#f0ece6] mb-1">Connection Status</h3>
              <p className="text-xs text-[#4a4540]">Real-time platform health</p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full border-2 border-[#c97a40]/20 border-t-[#c97a40] flex items-center justify-center"
            >
              <Zap className="w-3 h-3 text-[#c97a40]" />
            </motion.div>
          </div>

          {/* Platform Health Cards */}
          <div className="space-y-2 mb-6">
            {PLATFORM_HEALTH_SEQUENCE.map((item, idx) => (
              <motion.div
                key={item.platform}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="rounded-xl bg-[#1e1d1b] border border-white/[0.04] p-3.5 flex items-center justify-between hover:border-white/[0.08] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <motion.div
                    animate={{ scale: item.status === 'healthy' ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.dot }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#f0ece6]">{item.platform}</p>
                    <p className="text-[10px] text-[#4a4540]">
                      {item.status === 'healthy' ? '✓ Active' : '⚠ Stale'} · {item.time} ago
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{
                    backgroundColor: item.status === 'healthy' ? ['rgba(74, 157, 110, 0.1)', 'rgba(74, 157, 110, 0.2)'] : 'rgba(196, 154, 60, 0.1)',
                    borderColor: item.status === 'healthy' ? ['rgba(74, 157, 110, 0.2)', 'rgba(74, 157, 110, 0.3)'] : 'rgba(196, 154, 60, 0.2)',
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-3 py-1.5 rounded-lg border text-[9px] font-bold shrink-0"
                  style={{
                    color: item.status === 'healthy' ? '#4a9d6e' : '#c49a3c',
                  }}
                >
                  {item.status === 'healthy' ? 'LIVE' : 'ALERT'}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.05] my-4" />

          {/* Low Stock Section */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-[#f0ece6] mb-3 uppercase tracking-wider">Low Stock Items</h4>
            <div className="space-y-2">
              {PRODUCT_SEQUENCE.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`rounded-lg border p-3 flex items-center gap-3 ${
                    p.status === 'low-stock'
                      ? 'bg-[#c0554e]/5 border-[#c0554e]/20'
                      : 'bg-[#c49a3c]/5 border-[#c49a3c]/20'
                  }`}
                >
                  <div className="text-2xl">{p.image}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#f0ece6] truncate">{p.title}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {p.platforms.map((platform) => (
                        <span key={platform} className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.03] text-[#6a6460]">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 1],
                      color: p.status === 'low-stock' ? ['#c0554e', '#e8857e', '#c0554e'] : ['#c49a3c', '#d4b456', '#c49a3c'],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-right shrink-0"
                  >
                    <p className="text-base font-black">{p.quantity}</p>
                    <p className="text-[8px] text-[#4a4540]">left</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── RIGHT: PRICE SYNC & ACTIONS DASHBOARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-white/[0.08] bg-[#1a1916] overflow-hidden shadow-2xl"
      >
        {/* Realistic browser-like header */}
        <div className="bg-[#141312] border-b border-white/[0.05] px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#c0554e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#c49a3c]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#4a9d6e]" />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#1a1916] rounded-md px-3 py-1.5 border border-white/[0.03]">
            <div className="w-1 h-1 rounded-full bg-[#c97a40]/40" />
            <span className="text-[9px] font-mono text-[#4a4540]">soldsync.io/actions</span>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-6">
          {/* Active Product Section */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#f0ece6] mb-4">Active Sync</h3>

            {/* Product Card with Image */}
            <motion.div
              key={`product-${activeProduct}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="rounded-xl bg-[#1e1d1b] border border-white/[0.04] p-4 mb-4 overflow-hidden"
            >
              {/* Product Image Area */}
              <div className="mb-4 rounded-lg bg-gradient-to-br from-[#2a2927] to-[#1a1916] p-4 flex items-center justify-center min-h-[140px] border border-white/[0.04]">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-7xl"
                >
                  {product.image}
                </motion.div>
              </div>

              {/* Product Info */}
              <div className="mb-4">
                <p className="text-xs font-bold text-[#7a7268] uppercase tracking-wider mb-1">Featured Product</p>
                <h4 className="text-sm font-bold text-[#f0ece6] mb-3">{product.title}</h4>

                {/* Price Animation */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-baseline gap-2">
                    <motion.span
                      key={`old-${activeProduct}`}
                      animate={{ opacity: priceAnimating ? 0.4 : 1 }}
                      transition={{ duration: 0.6 }}
                      className="text-xs text-[#7a7268] line-through"
                    >
                      ${product.price.toFixed(2)}
                    </motion.span>
                    <motion.span
                      key={`new-${activeProduct}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={
                        priceAnimating
                          ? { scale: 1, opacity: 1 }
                          : { scale: 0.8, opacity: 0 }
                      }
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="text-sm font-bold text-[#4a9d6e]"
                    >
                      ${product.newPrice.toFixed(2)}
                    </motion.span>
                    <motion.span
                      animate={priceAnimating ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      className="text-[10px] font-bold text-[#4a9d6e] bg-[#4a9d6e]/15 border border-[#4a9d6e]/25 px-2 py-0.5 rounded"
                    >
                      -12%
                    </motion.span>
                  </div>
                </div>

                {/* Sync Status */}
                <motion.div
                  animate={priceAnimating ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex items-center gap-2 text-[10px]"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-3 h-3"
                  >
                    <Zap className="w-3 h-3 text-[#c97a40]" />
                  </motion.div>
                  <span className="text-[#c97a40] font-semibold">Syncing to platforms...</span>
                </motion.div>
              </div>

              {/* Platform Sync Indicators */}
              <motion.div
                animate={priceAnimating ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex gap-2 border-t border-white/[0.05] pt-4"
              >
                {product.platforms.map((platform, idx) => (
                  <motion.div
                    key={platform}
                    initial={{ scale: 0 }}
                    animate={syncComplete ? { scale: 1 } : { scale: 0 }}
                    transition={{ delay: 0.8 + idx * 0.2 }}
                    className="flex-1 rounded-lg bg-[#4a9d6e]/10 border border-[#4a9d6e]/25 py-2 flex items-center justify-center gap-1.5"
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={syncComplete ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 1 + idx * 0.2 }}
                    >
                      <Check className="w-3 h-3 text-[#4a9d6e]" />
                    </motion.span>
                    <span className="text-[9px] font-bold text-[#4a9d6e]">{platform}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.05] my-4" />

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="rounded-lg bg-[#4a9d6e]/5 border border-[#4a9d6e]/20 p-3"
            >
              <p className="text-[9px] text-[#4a4540] mb-2 uppercase tracking-wider">Sync Speed</p>
              <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg font-black text-[#4a9d6e]"
              >
                2.3s
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="rounded-lg bg-[#c97a40]/5 border border-[#c97a40]/20 p-3"
            >
              <p className="text-[9px] text-[#4a4540] mb-2 uppercase tracking-wider">Success Rate</p>
              <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                className="text-lg font-black text-[#c97a40]"
              >
                100%
              </motion.p>
            </motion.div>
          </div>

          {/* Product Counter */}
          <div className="mt-4 text-center">
            <motion.div className="flex items-center justify-center gap-2">
              {PRODUCT_SEQUENCE.map((_, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    scale: activeProduct === idx ? 1.3 : 1,
                    backgroundColor: activeProduct === idx ? '#c97a40' : '#4a4540',
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-1.5 h-1.5 rounded-full"
                />
              ))}
            </motion.div>
            <p className="text-[8px] text-[#4a4540] mt-2">
              {activeProduct + 1} of {PRODUCT_SEQUENCE.length}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
