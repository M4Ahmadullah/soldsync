'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Loader2, Minus, Zap, RefreshCw } from 'lucide-react'

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$9.99',
    period: '/mo',
    description: 'For resellers getting started on 2 platforms.',
    syncs: '50 syncs / mo',
    platforms: '2 platforms',
    highlight: false,
    accent: '#7a9ec4',
    badge: null,
    features: [
      '2 platforms (any combination)',
      '50 sync events per month',
      'Real-time webhook processing',
      'Failure email alerts',
      'Activity log (7-day)',
    ],
    missing: ['All 3 platforms', 'No-match alerts', 'Weekly digest'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$29.99',
    period: '/mo',
    description: 'For active resellers on all 3 platforms daily.',
    syncs: '500 syncs / mo',
    platforms: 'All 3 platforms',
    highlight: true,
    accent: '#c97a40',
    badge: 'Most popular',
    features: [
      'All 3 platforms (Shopify + eBay + Etsy)',
      '500 sync events per month',
      'Real-time webhook processing',
      'Failure & no-match email alerts',
      'Weekly sync digest',
      'Full activity log (30-day)',
    ],
    missing: ['Unlimited syncs', 'Priority support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$59.99',
    period: '/mo',
    description: 'For high-volume sellers who need zero missed syncs.',
    syncs: 'Unlimited syncs',
    platforms: 'All 3 platforms',
    highlight: false,
    accent: '#4a9d6e',
    badge: null,
    features: [
      'All 3 platforms (Shopify + eBay + Etsy)',
      'Unlimited sync events',
      'Real-time webhook processing',
      'All email alert types',
      'Weekly sync digest',
      'Full activity log (90-day)',
      'Priority email support',
    ],
    missing: [],
  },
]

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)
    try {
      const res = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1916] text-[#f0ece6] px-4 py-16">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#c97a40]/[0.04] rounded-full blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-6 h-6 rounded-md bg-[#c97a40]/15 border border-[#c97a40]/25 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5">
                <path d="M9 14L14 18L14 9" stroke="#c97a40" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M23 18L18 14L18 23" stroke="#4a9d6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="16" cy="16" r="2" fill="#f0ece6"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">
              Sold<span className="text-[#c97a40]">Sync</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-[#f0ece6] mb-3">Choose your plan</h1>
          <p className="text-sm text-[#7a7268]">
            7-day free trial on every plan. No credit card required to start.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-4 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl flex flex-col overflow-hidden transition-all ${
                plan.highlight
                  ? 'border-2 border-[#c97a40]/40 bg-[#221f1b] shadow-[0_0_0_1px_rgba(201,122,64,0.08),0_20px_60px_rgba(0,0,0,0.5)]'
                  : 'border border-white/[0.07] bg-[#212120]'
              }`}
            >
              {/* Top glow line for highlighted */}
              {plan.highlight && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c97a40]/60 to-transparent" />
              )}

              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#c97a40]/15 border border-[#c97a40]/25 text-[#c97a40] text-[10px] font-bold uppercase tracking-wider">
                    <Zap className="w-2.5 h-2.5" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-base font-bold text-[#f0ece6] mb-0.5">{plan.name}</h3>
                  <p className="text-xs text-[#4a4540] leading-relaxed mb-5">{plan.description}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-[#f0ece6] tracking-tight">{plan.price}</span>
                    <span className="text-[#4a4540] mb-1 text-sm">{plan.period}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[plan.syncs, plan.platforms].map((tag) => (
                      <span key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border"
                        style={{ color: plan.accent, borderColor: `${plan.accent}30`, backgroundColor: `${plan.accent}10` }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#b8b0a6]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4a9d6e] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#3a3530]">
                      <Minus className="w-3.5 h-3.5 text-[#2e2c28] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading !== null}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${
                    plan.highlight
                      ? 'bg-[#c97a40] hover:bg-[#b86c34] text-white shadow-lg shadow-[#c97a40]/20'
                      : 'bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-[#b8b0a6] hover:text-[#f0ece6]'
                  }`}
                >
                  {loading === plan.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <ArrowRight className="h-4 w-4" />
                  }
                  Start free trial
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-[#4a4540]">
          All plans include a 7-day free trial. Cancel anytime via the Stripe Customer Portal.
        </p>
        <p className="mt-3 text-center text-xs text-[#3a3530]">
          Already subscribed?{' '}
          <Link href="/dashboard" className="text-[#7a7268] hover:text-[#b8b0a6] transition-colors underline underline-offset-2">
            Go to dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}
