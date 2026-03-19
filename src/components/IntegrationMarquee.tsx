'use client'

import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'

const PLATFORMS = [
  { name: 'Shopify', tagline: 'Products & Orders', color: '#6da84a' },
  { name: 'eBay',    tagline: 'Listings & Sales',  color: '#4a7ab0' },
  { name: 'Etsy',   tagline: 'Listings & Orders', color: '#c97a40' },
]

const COMING = ['Depop', 'Poshmark', 'Mercari', 'Vinted']

function PlatformIcon({ name }: { name: string }) {
  if (name === 'Shopify') {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5">
        <ShoppingBag size={42} color="#6da84a" strokeWidth={1.5} />
        <span style={{ fontSize: 13, fontWeight: 800, color: '#6da84a', letterSpacing: 1 }}>SHOPIFY</span>
      </div>
    )
  }
  if (name === 'eBay') {
    return (
      <div
        className="flex items-center justify-center select-none"
        style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, lineHeight: 1, gap: 0 }}
      >
        <span style={{ fontSize: 26, color: '#e53238' }}>e</span>
        <span style={{ fontSize: 26, color: '#0064d2' }}>B</span>
        <span style={{ fontSize: 26, color: '#f5af02' }}>a</span>
        <span style={{ fontSize: 26, color: '#86b817' }}>y</span>
      </div>
    )
  }
  // Etsy
  return (
    <div
      className="flex items-center justify-center select-none"
      style={{
        width: 56, height: 56,
        borderRadius: '50%',
        border: '2.5px solid #c97a40',
        background: 'rgba(201,122,64,0.12)',
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 700,
        fontSize: 34,
        color: '#c97a40',
        lineHeight: 1,
      }}
    >
      e
    </div>
  )
}

export default function IntegrationMarquee() {
  return (
    <div className="w-full border-y border-white/[0.05] py-14 bg-[#1b1a18]">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-[#3a3530] mb-10">
          Syncs across your platforms
        </p>

        <div className="grid grid-cols-3 gap-5 mb-10">
          {PLATFORMS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.12, ease: 'easeOut' as const }}
              className="flex flex-col items-center gap-4 rounded-2xl border bg-[#1e1d1b] px-5 py-8 text-center"
              style={{ borderColor: `${p.color}25` }}
            >
              {/* Icon container */}
              <div
                className="rounded-2xl flex items-center justify-center"
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: `${p.color}10`,
                  border: `1.5px solid ${p.color}30`,
                }}
              >
                <PlatformIcon name={p.name} />
              </div>

              <div>
                <p className="text-[15px] font-bold text-[#f0ece6]">{p.name}</p>
                <p className="text-[11px] text-[#4a4540] mt-0.5">{p.tagline}</p>
              </div>

              <div
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full"
                style={{ color: p.color, backgroundColor: `${p.color}12`, border: `1px solid ${p.color}30` }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: p.color }} />
                Live
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' as const }}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <span className="text-[11px] text-[#3a3530] font-medium">Coming soon:</span>
          {COMING.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.07, ease: 'easeOut' as const }}
              className="text-[11px] text-[#4a4540] border border-white/[0.06] bg-white/[0.02] px-3 py-1 rounded-full"
            >
              {name}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
