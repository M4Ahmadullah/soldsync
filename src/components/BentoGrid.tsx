'use client'

import { motion } from 'framer-motion'
import { Zap, ShieldCheck, Bell, BarChart2, RefreshCw } from 'lucide-react'

const items = [
  {
    title: 'Webhook-first, not polling',
    description: 'Sales trigger instant delistings via real-time webhooks — zero polling lag, zero exposure window.',
    icon: Zap,
    color: '#c97a40',
    span: 'md:col-span-2',
    detail: 'Avg response < 3s',
  },
  {
    title: 'Zero double-sales',
    description: 'The moment a buyer checks out anywhere, your listing vanishes everywhere else — in under 3 seconds.',
    icon: ShieldCheck,
    color: '#c97a40',
    span: 'md:col-span-1',
    detail: '100% prevention rate',
  },
  {
    title: 'Every direction covered',
    description: 'Sell on Etsy → Shopify & eBay delist. Sell on eBay → Etsy & Shopify delist. Every combination, automatically.',
    icon: RefreshCw,
    color: '#7a9ec4',
    span: 'md:col-span-1',
    detail: '6 platform pairs',
  },
  {
    title: 'Instant failure alerts',
    description: 'If a delist fails, you get an email immediately — before a second buyer can claim the same item.',
    icon: Bell,
    color: '#9a7ac4',
    span: 'md:col-span-2',
    detail: 'Email in < 10s',
  },
  {
    title: 'Full audit log',
    description: 'Every sync event logged with latency, status, and matched title. Complete audit trail per account. Up to 90 days of history available at a glance.',
    icon: BarChart2,
    color: '#c97a40',
    span: 'md:col-span-3',
    detail: 'Up to 90-day history',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function BentoGrid() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.05]">
      <div className="text-center mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#c97a40] mb-3">Why SoldSync</p>
        <h2 className="text-4xl font-bold text-[#f0ece6] mb-4 leading-tight">Built different from every other tool</h2>
        <p className="text-[#7a7268] max-w-xl mx-auto text-base leading-relaxed">
          Vendoo and List Perfectly poll on a schedule. SoldSync listens in real time.
          That gap costs you a sale — ours does not.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        {items.map((item) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.title}
              variants={cardVariants}
              className={`group rounded-2xl border border-white/[0.07] bg-[#1e1d1b] p-7 relative overflow-hidden hover:border-white/[0.13] transition-colors duration-300 ${item.span}`}
            >
              {/* Corner glow */}
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-10 -mt-10 opacity-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-20"
                style={{ backgroundColor: item.color }}
              />

              {/* Icon */}
              <div
                className="relative z-10 mb-5 inline-flex p-3 rounded-xl border"
                style={{
                  backgroundColor: `${item.color}10`,
                  borderColor: `${item.color}25`,
                }}
              >
                <Icon className="w-5 h-5" style={{ color: item.color }} />
              </div>

              <h3 className="text-[15px] font-semibold text-[#f0ece6] mb-2 relative z-10 leading-snug">{item.title}</h3>
              <p className="text-sm text-[#6a6460] leading-relaxed relative z-10 mb-5">{item.description}</p>

              {/* Stat chip */}
              <div
                className="relative z-10 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
                style={{
                  color: item.color,
                  backgroundColor: `${item.color}10`,
                  borderColor: `${item.color}25`,
                }}
              >
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: item.color }} />
                {item.detail}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
