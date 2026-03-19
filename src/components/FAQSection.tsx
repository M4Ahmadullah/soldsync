'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus } from 'lucide-react'

const FAQ = [
  {
    q: 'What if my listing titles are slightly different across platforms?',
    a: 'SoldSync uses fuzzy title matching (Jaro-Winkler ≥90% similarity). Minor spacing, capitalisation, or punctuation differences are handled automatically. For best results, keep titles at least 90% identical across platforms.',
  },
  {
    q: 'Does SoldSync create, edit, or price my listings?',
    a: 'No. SoldSync is single-purpose: it removes a listing the instant the item sells elsewhere. It never creates, edits, reprices, or publishes listings.',
  },
  {
    q: 'How is SoldSync different from Vendoo or List Perfectly?',
    a: 'Vendoo and List Perfectly poll on a schedule — if your item sells between polls, you get a double-sale. SoldSync uses real-time webhooks: when a sale happens, we know in under a second. No polling gap, no window of exposure.',
  },
  {
    q: 'Which platforms are supported right now?',
    a: 'Shopify, eBay, and Etsy are live. Depop and Poshmark are next on the roadmap.',
  },
  {
    q: 'Can I cancel at any time?',
    a: 'Yes. Cancel instantly through the Stripe Customer Portal. Access continues until the end of your current billing period. No penalties, no questions.',
  },
  {
    q: 'What happens if I exceed my monthly sync limit?',
    a: 'Syncs pause until the next billing cycle or you upgrade. You will receive an email warning when you reach 80% of your limit so you can act before any gaps.',
  },
  {
    q: 'Is my OAuth token data secure?',
    a: 'All OAuth tokens are stored AES-256-GCM encrypted at rest. They are never logged, never exposed client-side, and never shared with third parties. Database access is protected by Row Level Security.',
  },
  {
    q: 'What is the Platform Health feature?',
    a: "Platform Health shows you when each platform last fired a webhook and whether your connection is active. If webhooks go silent for 24+ hours, you'll see a warning so you can reconnect before double-sales happen.",
  },
  {
    q: 'How does the Price Sync feature work?',
    a: 'Change a price on Shopify and SoldSync automatically updates it on eBay and Etsy in real-time. No manual re-pricing across 3 tabs. Growth & Pro plans only.',
  },
  {
    q: 'What are Low Stock Alerts?',
    a: 'When an item falls to your threshold quantity (default: 2) and is listed on multiple platforms, SoldSync sends you an email. Prevents the race condition where two people buy simultaneously before you can delist.',
  },
  {
    q: 'Can I delist manually without waiting for a sale?',
    a: 'Yes. Use the "Delist Everywhere" button on your dashboard. Type the listing title and SoldSync will end it across all your connected platforms instantly. Great for local pickups or direct sales.',
  },
  {
    q: 'What happens if my webhook connection fails?',
    a: 'SoldSync runs a daily Webhook Watchdog that re-registers webhooks automatically. If a webhook silently expires, the watchdog will restore it within 24 hours. Pro plan gets priority alerts.',
  },
]

const INITIAL_COUNT = 5

export default function FAQSection() {
  const [showAll, setShowAll] = useState(false)
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const visible = showAll ? FAQ : FAQ.slice(0, INITIAL_COUNT)

  return (
    <section id="faq" className="py-16 md:py-24 border-t border-white/[0.05]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-72px' }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#c97a40] mb-3">Questions</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f0ece6] mb-4 leading-tight">Frequently asked</h2>
          <p className="text-[#7a7268] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            If your question isn't here, email us at support@soldsync.app.
          </p>
        </motion.div>

        <div className="space-y-2.5 max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {visible.map(({ q, a }, i) => (
              <motion.div
                key={q}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, delay: i < INITIAL_COUNT ? i * 0.06 : 0, ease: 'easeOut' }}
                className="rounded-xl border border-white/[0.07] bg-[#1e1d1b] overflow-hidden hover:border-white/[0.12] transition-colors"
              >
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-start justify-between gap-4 px-6 py-4 text-left"
                >
                  <span className="font-semibold text-[#c8c2bb] text-[14px] leading-snug">{q}</span>
                  <motion.div
                    animate={{ rotate: openIdx === i ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0 mt-0.5"
                  >
                    <ChevronDown className="w-4 h-4 text-[#4a4540]" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {openIdx === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 pt-1 text-[13px] text-[#7a7268] leading-relaxed border-t border-white/[0.05]">
                        {a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!showAll && (
          <motion.div
            className="flex justify-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 text-[13px] text-[#7a7268] hover:text-[#c8c2bb] border border-white/[0.07] hover:border-white/[0.14] bg-[#1e1d1b] px-5 py-2.5 rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Show {FAQ.length - INITIAL_COUNT} more questions
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
