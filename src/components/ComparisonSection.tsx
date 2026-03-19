'use client'

import { motion } from 'framer-motion'
import { XCircle, CheckCircle2, Zap } from 'lucide-react'

const BEFORE = [
  { time: '2:04 pm', text: 'Buyer 1 purchases on Etsy' },
  { time: '2:11 pm', text: 'Buyer 2 purchases the same item on eBay' },
  { time: '2:19 pm', text: 'You finally notice — both sales are live' },
  { time: '2:23 pm', text: 'Forced cancellation, defect strike, angry review' },
]

const AFTER = [
  { time: '2:04:00', text: 'Buyer 1 purchases on Etsy' },
  { time: '2:04:01', text: 'SoldSync webhook fires — sale detected' },
  { time: '2:04:03', text: 'eBay & Shopify listings ended automatically' },
  { time: '2:04:03', text: 'No double-sale. No defect. No stress.' },
]

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden:  { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

const itemVariantsR = {
  hidden:  { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

export default function ComparisonSection() {
  return (
    <div className="grid md:grid-cols-2 gap-4 items-stretch">
      {/* ── Without SoldSync ── */}
      <div className="rounded-2xl border border-[#c0554e]/15 bg-[#1e1c1b] p-7 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-[#c0554e]/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-7">
            <div className="w-2 h-2 rounded-full bg-[#c0554e]/70" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#c0554e]/70">Without SoldSync</p>
          </div>
          <motion.ul
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-4 flex-1"
          >
            {BEFORE.map((item, i) => (
              <motion.li key={i} variants={itemVariants} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-[#c0554e]/10 border border-[#c0554e]/25 flex items-center justify-center shrink-0">
                  <XCircle className="w-3 h-3 text-[#c0554e]/70" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#c0554e]/40 block mb-0.5">{item.time}</span>
                  <span className="text-[13px] text-[#5a5450] leading-snug">{item.text}</span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
          <div className="mt-6 pt-5 border-t border-[#c0554e]/10 flex items-start gap-2">
            <XCircle className="w-3.5 h-3.5 text-[#c0554e]/40 shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#c0554e]/55 leading-relaxed">
              Forced cancellation · defect strike · 1-star review · angry buyer messages
            </p>
          </div>
        </div>
      </div>

      {/* ── With SoldSync ── */}
      <div className="rounded-2xl border border-[#c97a40]/20 bg-[#1e1c19] p-7 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-[#c97a40]/6 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-7">
            <span className="w-2 h-2 rounded-full bg-[#c97a40] animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#c97a40]/80">With SoldSync</p>
          </div>
          <motion.ul
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-4 flex-1"
          >
            {AFTER.map((item, i) => (
              <motion.li key={i} variants={itemVariantsR} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-[#c97a40]/12 border border-[#c97a40]/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-[#c97a40]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#c97a40]/40 block mb-0.5">{item.time}</span>
                  <span className="text-[13px] text-[#b8b0a6] leading-snug">{item.text}</span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
          <div className="mt-6 pt-5 border-t border-[#c97a40]/12 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#c97a40]/60 shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#c97a40]/65 leading-relaxed">
              Clean sale · zero defects · happy buyer · perfect seller metrics
            </p>
          </div>
        </div>
      </div>

      {/* ── Speed bar ── */}
      <div className="md:col-span-2 rounded-2xl border border-white/[0.06] bg-[#1e1d1b] overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
          <div className="p-5 text-center">
            <p className="text-[10px] text-[#4a4540] mb-2 uppercase tracking-wider">Polling tools</p>
            <p className="text-3xl font-bold text-[#c0554e]/70 font-mono leading-none">5–15<span className="text-lg"> min</span></p>
            <p className="text-[10px] text-[#4a4540] mt-1.5">exposure window</p>
          </div>
          <div className="p-5 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[11px] text-[#3a3530] mb-1">vs</p>
              <Zap className="w-5 h-5 text-[#c97a40]/40 mx-auto" />
            </div>
          </div>
          <div className="p-5 text-center">
            <p className="text-[10px] text-[#4a4540] mb-2 uppercase tracking-wider">SoldSync webhook</p>
            <p className="text-3xl font-bold text-[#c97a40] font-mono leading-none">&lt;3<span className="text-lg"> sec</span></p>
            <p className="text-[10px] text-[#4a4540] mt-1.5">zero polling gap</p>
          </div>
        </div>
      </div>
    </div>
  )
}
