'use client'

import { motion } from 'framer-motion'
import { ShopifyLogo, EbayLogo, EtsyLogo } from './PlatformLogos'

const PLATFORMS = [
  { name: 'Shopify', tagline: 'Products & Orders', color: '#95bf47', Logo: ShopifyLogo, logoSize: 52 },
  { name: 'eBay',    tagline: 'Listings & Sales',  color: '#e53238', Logo: EbayLogo,   logoSize: 32 },
  { name: 'Etsy',    tagline: 'Listings & Orders', color: '#f1641e', Logo: EtsyLogo,   logoSize: 32 },
]

const COMING = ['Depop', 'Poshmark', 'Mercari', 'Vinted']

export default function IntegrationMarquee() {
  return (
    <div className="w-full border-y border-white/[0.05] py-14 bg-[#1b1a18]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.p
          className="text-center text-[11px] font-semibold uppercase tracking-widest text-[#3a3530] mb-10"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Syncs across your platforms
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-10">
          {PLATFORMS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.12, ease: 'easeOut' as const }}
              className="flex flex-row sm:flex-col items-center sm:items-center gap-6 rounded-2xl bg-[#1e1d1b] px-8 py-8 sm:py-12 sm:text-center"
            >
              {/* Logo */}
              <p.Logo size={p.logoSize} />

              <div className="flex-1 sm:flex-none">
                <p className="text-[15px] font-bold text-[#f0ece6]">{p.name}</p>
                <p className="text-[11px] text-[#4a4540] mt-0.5">{p.tagline}</p>
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
