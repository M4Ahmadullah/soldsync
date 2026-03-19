'use client'

import { motion } from 'framer-motion'
import { Activity, AlertCircle, DollarSign, Trash2, Check, Clock, TrendingDown } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

export default function CapabilityDemo() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="grid lg:grid-cols-2 gap-6"
    >
      {/* ── DEMO 1: Monitoring & Intelligence ── */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-white/[0.08] bg-[#1e1d1b] overflow-hidden shadow-lg hover:border-white/[0.12] transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] bg-[#1a1916]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#c97a40] animate-pulse" />
            <span className="text-xs font-bold text-[#7a7268]">Platform Health</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-semibold text-[#4a9d6e] bg-[#4a9d6e]/10 border border-[#4a9d6e]/20 px-2 py-1 rounded-full">
            <span className="w-1 h-1 rounded-full bg-[#4a9d6e]" />
            LIVE
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="space-y-3 mb-5">
            {/* Shopify - Healthy */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-lg border border-[#4a9d6e]/20 bg-[#4a9d6e]/5 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#4a9d6e]" />
                    <p className="text-xs font-semibold text-[#f0ece6]">Shopify</p>
                  </div>
                  <p className="text-[10px] text-[#4a9d6e]">Healthy · 2 min ago</p>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#4a9d6e] bg-[#4a9d6e]/15 border border-[#4a9d6e]/25 px-2 py-1 rounded-full">
                  <Check className="w-2.5 h-2.5" />
                  ACTIVE
                </div>
              </div>
            </motion.div>

            {/* eBay - Warning */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-lg border border-[#c49a3c]/20 bg-[#c49a3c]/5 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#c49a3c]" />
                    <p className="text-xs font-semibold text-[#f0ece6]">eBay</p>
                  </div>
                  <p className="text-[10px] text-[#c49a3c]">Stale · 6 hours ago</p>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#c49a3c] bg-[#c49a3c]/15 border border-[#c49a3c]/25 px-2 py-1 rounded-full">
                  <AlertCircle className="w-2.5 h-2.5" />
                  CHECK
                </div>
              </div>
            </motion.div>

            {/* Etsy - Healthy */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-lg border border-[#4a9d6e]/20 bg-[#4a9d6e]/5 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#4a9d6e]" />
                    <p className="text-xs font-semibold text-[#f0ece6]">Etsy</p>
                  </div>
                  <p className="text-[10px] text-[#4a9d6e]">Healthy · 30 min ago</p>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#4a9d6e] bg-[#4a9d6e]/15 border border-[#4a9d6e]/25 px-2 py-1 rounded-full">
                  <Check className="w-2.5 h-2.5" />
                  ACTIVE
                </div>
              </div>
            </motion.div>
          </div>

          {/* Low Stock Alerts */}
          <div className="border-t border-white/[0.05] pt-4">
            <p className="text-xs font-semibold text-[#7a7268] mb-3">Low Stock Alerts</p>
            <div className="space-y-2.5">
              {/* Item 1 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-lg bg-[#141312] border border-[#c0554e]/20 p-2.5 flex items-center gap-2.5"
              >
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#c97a40]/40 to-[#4a9d6e]/40 flex items-center justify-center text-xs font-bold text-[#f0ece6]">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#b8b0a6] truncate">Nike Air Max 90</p>
                  <p className="text-[9px] text-[#4a4540]">Shopify • eBay • Etsy</p>
                </div>
                <div className="text-[10px] font-bold text-[#c0554e]">ALERT</div>
              </motion.div>

              {/* Item 2 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="rounded-lg bg-[#141312] border border-[#c49a3c]/20 p-2.5 flex items-center gap-2.5"
              >
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#c49a3c]/40 to-[#c97a40]/40 flex items-center justify-center text-xs font-bold text-[#f0ece6]">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#b8b0a6] truncate">Vintage Leather Jacket</p>
                  <p className="text-[9px] text-[#4a4540]">Shopify • Etsy</p>
                </div>
                <div className="text-[10px] font-bold text-[#c49a3c]">WARN</div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── DEMO 2: Actions & Automation ── */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-white/[0.08] bg-[#1e1d1b] overflow-hidden shadow-lg hover:border-white/[0.12] transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] bg-[#1a1916]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#c97a40] animate-pulse" />
            <span className="text-xs font-bold text-[#7a7268]">Smart Actions</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-semibold text-[#c97a40] bg-[#c97a40]/10 border border-[#c97a40]/20 px-2 py-1 rounded-full">
            <span className="w-1 h-1 rounded-full bg-[#c97a40]" />
            READY
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="space-y-3 mb-5">
            {/* Price Sync */}
            <div>
              <p className="text-xs font-semibold text-[#7a7268] mb-2.5">Price Synchronization</p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="rounded-lg bg-[#141312] border border-white/[0.05] p-3"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#b8b0a6] mb-1">iPhone 15 Pro Case</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#7a7268] line-through">$24.99</span>
                      <span className="text-xs font-bold text-[#4a9d6e]">$19.99</span>
                      <span className="text-[8px] text-[#4a9d6e] bg-[#4a9d6e]/10 px-1.5 py-0.5 rounded">-20%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-[#c97a40]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c97a40] animate-pulse" />
                      SYNCING
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 text-[9px]">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#c97a40]/10 border border-[#c97a40]/20 text-[#c97a40] font-medium"
                  >
                    <DollarSign className="w-2.5 h-2.5" />
                    eBay
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#c97a40]/10 border border-[#c97a40]/20 text-[#c97a40] font-medium"
                  >
                    <DollarSign className="w-2.5 h-2.5" />
                    Etsy
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Manual Delist */}
            <div>
              <p className="text-xs font-semibold text-[#7a7268] mb-2.5">Manual Delist</p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="rounded-lg bg-[#141312] border border-white/[0.05] p-3"
              >
                <p className="text-xs font-medium text-[#b8b0a6] mb-2.5">Vintage Band Tee</p>
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.5 }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#c0554e]/15 border border-[#c0554e]/25 text-[#c0554e] text-[9px] font-bold"
                  >
                    <Trash2 className="w-3 h-3" />
                    Shopify
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.65 }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#c0554e]/15 border border-[#c0554e]/25 text-[#c0554e] text-[9px] font-bold"
                  >
                    <Trash2 className="w-3 h-3" />
                    eBay
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.8 }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#c0554e]/15 border border-[#c0554e]/25 text-[#c0554e] text-[9px] font-bold"
                  >
                    <Trash2 className="w-3 h-3" />
                    Etsy
                  </motion.div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                  <span className="text-[9px] text-[#4a4540]">Delist everywhere</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.45 }}
                    className="text-[9px] font-bold text-[#4a9d6e] flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Complete
                  </motion.span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stats */}
          <div className="border-t border-white/[0.05] pt-4 grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="rounded-lg bg-[#4a9d6e]/5 border border-[#4a9d6e]/20 p-2.5"
            >
              <p className="text-[9px] text-[#4a4540] mb-1">Response Time</p>
              <p className="text-sm font-bold text-[#4a9d6e]">&lt; 3 seconds</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="rounded-lg bg-[#c97a40]/5 border border-[#c97a40]/20 p-2.5"
            >
              <p className="text-[9px] text-[#4a4540] mb-1">Success Rate</p>
              <p className="text-sm font-bold text-[#c97a40]">100%</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
