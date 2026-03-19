'use client'

import { useState } from 'react'

const REVIEWS = [
  { name: 'Sarah M.',  initials: 'SM', color: '#7a9ec4', stars: 5, role: 'Vintage reseller · eBay & Etsy', text: 'No more double-sales. I sell vintage on eBay and Etsy and double-sold twice in one month before SoldSync. Zero since.' },
  { name: 'Jake T.',   initials: 'JT', color: '#6da84a', stars: 5, role: 'Sneaker reseller · All 3 platforms', text: 'Set up in under 2 minutes. Connected Shopify and eBay, and it just works. Already caught 3 near double-sales this week.' },
  { name: 'Lisa K.',   initials: 'LK', color: '#c97a40', stars: 5, role: 'Sneaker reseller · Shopify & Etsy', text: 'I resell sneakers on all 3 platforms. Before SoldSync I was ending listings manually — slow and I still got burned twice.' },
  { name: 'Marcus W.', initials: 'MW', color: '#9d6a4a', stars: 5, role: 'Electronics reseller · Shopify', text: 'The webhook speed is unreal. Sale happens, listing ends in 1–2 seconds. My Shopify customers never see something out of stock.' },
  { name: 'Priya S.',  initials: 'PS', color: '#8a6ec4', stars: 5, role: 'Fashion reseller · eBay & Etsy', text: 'Tried the trial on a Tuesday. Had an Etsy sale sync to eBay and Shopify in 3 seconds. Paid the same day. Worth every penny.' },
  { name: 'Tom B.',    initials: 'TB', color: '#4a9d8a', stars: 5, role: 'Collectibles · All 3 platforms', text: 'Support helped me set up Shopify webhooks in minutes. After that, zero configuration. It just runs quietly in the background.' },
  { name: 'Alex R.',   initials: 'AR', color: '#c97a40', stars: 5, role: 'Vintage clothing · All 3 platforms', text: 'Vintage clothing is one-of-a-kind — instant cross-platform sync isn\'t optional for me, it\'s survival. SoldSync is non-negotiable.' },
  { name: 'Maria C.',  initials: 'MC', color: '#c05080', stars: 5, role: 'Jewellery reseller · Etsy & eBay', text: 'Love the activity log. I can see every sync event in real time and verify everything is working. Gives me complete peace of mind.' },
  { name: 'David L.',  initials: 'DL', color: '#5b8fc4', stars: 5, role: 'Tech reseller · Shopify & eBay', text: 'Vendoo polls every 10 min. Got double-sold twice in that window. SoldSync\'s webhooks are instant. Zero issues in 3 months.' },
  { name: 'Emma F.',   initials: 'EF', color: '#9dc44a', stars: 5, role: 'Home goods · All 3 platforms', text: 'The time I save not manually managing listings is worth 10× the subscription. I actually enjoy selling again.' },
]

const ROW_A = REVIEWS.slice(0, 5)
const ROW_B = REVIEWS.slice(5, 10)
const LOOP_A = [...ROW_A, ...ROW_A, ...ROW_A]
const LOOP_B = [...ROW_B, ...ROW_B, ...ROW_B]

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 12 12" fill="#c97a40">
          <path d="M6 1l1.4 2.8 3.1.5-2.2 2.1.5 3.1L6 8l-2.8 1.5.5-3.1L1.5 4.3l3.1-.5L6 1z"/>
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ r }: { r: typeof REVIEWS[number] }) {
  return (
    <div
      className="shrink-0 w-[340px] rounded-2xl border border-white/[0.07] bg-[#1e1d1b] p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 select-none"
          style={{ backgroundColor: `${r.color}20`, color: r.color, border: `1.5px solid ${r.color}35` }}
        >
          {r.initials}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-[#e0dbd5] leading-none">{r.name}</p>
          <p className="text-[11px] text-[#4a4540] mt-0.5 truncate">{r.role}</p>
        </div>
      </div>
      <Stars n={r.stars} />
      <p className="text-[13px] text-[#7a7268] leading-[1.65]">{r.text}</p>
    </div>
  )
}

export default function Testimonials() {
  const [pausedA, setPausedA] = useState(false)
  const [pausedB, setPausedB] = useState(false)

  return (
    <section className="py-24 border-t border-white/[0.05] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#c97a40] mb-3">Reviews</p>
        <h2 className="text-4xl font-bold text-[#f0ece6] mb-4 leading-tight">Loved by resellers</h2>
        <p className="text-[#7a7268] text-base max-w-md mx-auto leading-relaxed">
          Sellers across Shopify, eBay, and Etsy who stopped worrying about double-sales.
        </p>
      </div>

      {/* Row A — scrolls left, pauses on hover */}
      <div
        className="mb-4 relative"
        onMouseEnter={() => setPausedA(true)}
        onMouseLeave={() => setPausedA(false)}
      >
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#1a1916] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#1a1916] to-transparent z-10 pointer-events-none" />
        <div
          className="flex gap-4 w-max"
          style={{ animation: 'tLeft 42s linear infinite', animationPlayState: pausedA ? 'paused' : 'running' }}
        >
          {LOOP_A.map((r, i) => <ReviewCard key={i} r={r} />)}
        </div>
      </div>

      {/* Row B — scrolls right, pauses on hover */}
      <div
        className="relative"
        onMouseEnter={() => setPausedB(true)}
        onMouseLeave={() => setPausedB(false)}
      >
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#1a1916] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#1a1916] to-transparent z-10 pointer-events-none" />
        <div
          className="flex gap-4 w-max"
          style={{ animation: 'tRight 38s linear infinite', animationPlayState: pausedB ? 'paused' : 'running' }}
        >
          {LOOP_B.map((r, i) => <ReviewCard key={i} r={r} />)}
        </div>
      </div>

      <style>{`
        @keyframes tLeft  { from { transform: translateX(0); }         to { transform: translateX(-33.333%); } }
        @keyframes tRight { from { transform: translateX(-33.333%); }  to { transform: translateX(0); } }
      `}</style>
    </section>
  )
}
