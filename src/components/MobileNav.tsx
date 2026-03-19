'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'FAQ',          href: '#faq' },
]

interface Props {
  isLoggedIn: boolean
}

export default function MobileNav({ isLoggedIn }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-[#7a7268] hover:text-[#f0ece6] hover:bg-white/[0.06] transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-72 bg-[#1a1916] border-l border-white/[0.08] z-40 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                <span className="text-lg font-bold">Sold<span className="text-[#c97a40]">Sync</span></span>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-[#7a7268] hover:text-[#f0ece6] hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1 px-4 py-6 flex-1">
                {NAV_LINKS.map((l, i) => (
                  <motion.a
                    key={l.label}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-[15px] text-[#9a9188] hover:text-[#f0ece6] hover:bg-white/[0.05] px-4 py-3 rounded-xl transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.25 }}
                  >
                    {l.label}
                  </motion.a>
                ))}
              </nav>

              {/* CTAs */}
              <div className="px-4 pb-8 flex flex-col gap-3 border-t border-white/[0.06] pt-6">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#c97a40] hover:bg-[#b86c34] text-white font-semibold text-[14px] transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center w-full py-3 rounded-xl border border-white/[0.10] bg-white/[0.03] text-[#9a9188] font-medium text-[14px] transition-all"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth?tab=signup"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#c97a40] hover:bg-[#b86c34] text-white font-semibold text-[14px] transition-all"
                    >
                      <Zap className="w-4 h-4" />
                      Start free — 7 days
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
