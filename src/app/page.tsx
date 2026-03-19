import Link from 'next/link'
import { ArrowRight, CheckCircle2, Zap, ShieldCheck, ChevronDown, Minus, RefreshCw, Link2, Tag, XCircle } from 'lucide-react'
import IntegrationMarquee from '@/components/IntegrationMarquee'
import BentoGrid from '@/components/BentoGrid'
import SyncFlowDemo from '@/components/SyncFlowDemo'
import Testimonials from '@/components/Testimonials'
import HeroStats from '@/components/HeroStats'
import ComparisonSection from '@/components/ComparisonSection'

// ── Shared layout token ────────────────────────────────────────────────────
// Every content section uses max-w-6xl + px-6 + py-24 + border-t border-white/[0.05]
// Section headers always follow: eyebrow → h2 → descriptor

const W = 'max-w-6xl mx-auto px-6'

// ── Data ──────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'FAQ',          href: '#faq' },
]

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

const STEPS = [
  {
    n: '01',
    title: 'Connect your platforms',
    body: 'Link Shopify, eBay, and Etsy with one click each. Under 2 minutes total. SoldSync registers webhooks automatically — no manual setup.',
    color: '#c97a40',
    Icon: Link2,
  },
  {
    n: '02',
    title: 'Keep listing normally',
    body: 'Zero workflow changes. Keep titles consistent across platforms. SoldSync watches every platform silently in the background.',
    color: '#c97a40',
    Icon: Tag,
  },
  {
    n: '03',
    title: 'Sell — it\'s gone everywhere',
    body: 'The moment a buyer checks out on any platform, your listing is ended across every other connected store within seconds.',
    color: '#c97a40',
    Icon: Zap,
  },
]

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$9.99',
    period: '/mo',
    description: 'For resellers just getting started with 2 platforms.',
    syncs: '50 syncs / month',
    platforms: '2 platforms',
    features: [
      '2 platforms (any combination)',
      '50 sync events per month',
      'Real-time webhook processing',
      'Failure email alerts',
      'Activity log (7-day history)',
    ],
    missing: ['All 3 platforms', 'No-match alerts', 'Weekly digest', 'Priority support'],
    cta: 'Start free trial',
    highlight: false,
    accent: '#7a7268',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$29.99',
    period: '/mo',
    description: 'For active resellers who sell on all platforms daily.',
    syncs: '500 syncs / month',
    platforms: 'All 3 platforms',
    features: [
      'All 3 platforms (Shopify + eBay + Etsy)',
      '500 sync events per month',
      'Real-time webhook processing',
      'Failure & no-match email alerts',
      'Weekly sync digest email',
      'Full activity log (30-day history)',
      'AES-256 encrypted token storage',
    ],
    missing: ['Priority support', 'Unlimited syncs'],
    cta: 'Start free trial',
    highlight: true,
    accent: '#c97a40',
    badge: 'Most popular',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$59.99',
    period: '/mo',
    description: 'For high-volume sellers who cannot afford any missed sync.',
    syncs: 'Unlimited syncs',
    platforms: 'All 3 platforms',
    features: [
      'All 3 platforms (Shopify + eBay + Etsy)',
      'Unlimited sync events',
      'Real-time webhook processing',
      'Failure, no-match & all email alerts',
      'Weekly sync digest email',
      'Full activity log (90-day history)',
      'AES-256 encrypted token storage',
      'Priority email support',
    ],
    missing: [],
    cta: 'Start free trial',
    highlight: false,
    accent: '#4a9d6e',
  },
]

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
    q: 'What happens if I exceed my monthly sync limit?',
    a: 'On Starter and Pro, syncs pause until the next billing cycle or you upgrade. You will receive an email warning when you reach 80% of your limit so you can act before any gaps.',
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
    q: 'Is my OAuth token data secure?',
    a: 'All OAuth tokens are stored AES-256-GCM encrypted at rest. They are never logged, never exposed client-side, and never shared with third parties. Database access is protected by Row Level Security.',
  },
  {
    q: 'Can I cancel at any time?',
    a: 'Yes. Cancel instantly through the Stripe Customer Portal. Access continues until the end of your current billing period. No penalties, no questions.',
  },
]

// ── Components ─────────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, heading, sub }: { eyebrow: string; heading: string; sub: string }) {
  return (
    <div className="text-center mb-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#c97a40] mb-3">{eyebrow}</p>
      <h2 className="text-4xl font-bold text-[#f0ece6] mb-4 leading-tight">{heading}</h2>
      <p className="text-[#7a7268] text-base max-w-xl mx-auto leading-relaxed">{sub}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1a1916] text-[#f0ece6] overflow-x-hidden">

      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2.5 bg-[#1e1a15] border-b border-[#c97a40]/20 py-2 px-4" style={{ minHeight: '36px' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#c97a40] animate-pulse shrink-0" />
        <p className="text-[11px] text-[#c97a40]/80 text-center leading-none">
          <span className="font-semibold text-[#c97a40]">Limited launch pricing</span> — lock in your rate before it goes up
        </p>
        <Link href="/auth?tab=signup" className="text-[11px] font-bold text-[#f0ece6] bg-[#c97a40] hover:bg-[#b86c34] transition-colors px-2.5 py-0.5 rounded-md whitespace-nowrap">
          Claim now
        </Link>
      </div>

      {/* ── NAV ── */}
      <header className="fixed top-[36px] left-0 right-0 z-40 border-b border-white/[0.06] bg-[#1a1916]/95 backdrop-blur-xl">
        <div className={`${W} relative flex items-center justify-between`} style={{ height: '58px' }}>
          {/* Logo mark + wordmark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[#c97a40]/15 border border-[#c97a40]/25 flex items-center justify-center group-hover:bg-[#c97a40]/22 transition-colors">
              <RefreshCw className="w-3.5 h-3.5 text-[#c97a40]" />
            </div>
            <span className="text-[15px] font-bold tracking-tight">
              Sold<span className="text-[#c97a40]">Sync</span>
            </span>
          </Link>

          {/* Center nav — absolutely centered so it's always at true midpoint */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-[#6a6460] hover:text-[#b8b0a6] transition-colors px-3.5 py-2 rounded-lg hover:bg-white/[0.04]"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/auth"
              className="hidden sm:block text-sm text-[#6a6460] hover:text-[#b8b0a6] transition-colors px-3 py-2 rounded-lg hover:bg-white/[0.04]"
            >
              Sign in
            </Link>
            <Link
              href="/auth?tab=signup"
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-[#c97a40] hover:bg-[#b86c34] text-white transition-all shadow-sm shadow-[#c97a40]/25"
            >
              <Zap className="w-3 h-3" />
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-[94px] overflow-hidden">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 w-[700px] h-[700px] bg-[#c97a40]/[0.04] rounded-full blur-[180px] -mr-40 -mt-20" />
          <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-[#4a9d6e]/[0.03] rounded-full blur-[160px] -ml-20" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className={`relative ${W} w-full grid lg:grid-cols-2 gap-14 xl:gap-20 items-center py-10`}>

          {/* ── LEFT: copy ── */}
          <div className="flex flex-col items-start">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c97a40]/30 bg-[#c97a40]/8 text-[#c97a40] text-[11px] font-semibold mb-7 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c97a40] animate-pulse" />
              Real-time · Shopify · eBay · Etsy
            </div>

            {/* Headline */}
            <h1 className="text-[44px] sm:text-[52px] xl:text-[60px] font-bold tracking-tight leading-[1.06] mb-5">
              Sell everywhere.<br />
              Ship once.<br />
              <span className="text-gradient">Never oversell.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[16px] text-[#7a7268] leading-[1.7] mb-9 max-w-[430px]">
              The moment a buyer checks out on any platform, SoldSync ends every other listing automatically — no polling, no gaps, no double-sales.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10 w-full sm:w-auto">
              <Link
                href="/auth?tab=signup"
                className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#c97a40] hover:bg-[#b86c34] text-white font-semibold text-[14px] transition-all shadow-lg shadow-[#c97a40]/20"
              >
                Start free — 7 days
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/[0.10] bg-white/[0.03] hover:bg-white/[0.06] text-[#9a9188] font-medium text-[14px] transition-all"
              >
                See how it works
              </a>
            </div>

            {/* Social proof / stats — animated count-up */}
            <HeroStats />
          </div>

          {/* ── RIGHT: dashboard window ── */}
          <div className="relative hidden lg:block">
            {/* Glow behind window */}
            <div className="absolute -inset-8 rounded-3xl blur-2xl pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(201,122,64,0.08) 0%, transparent 70%)' }} />

            {/* Browser / app window */}
            <div className="relative rounded-2xl border border-white/[0.09] bg-[#191817] overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.7)]">

              {/* Window title bar */}
              <div className="flex items-center gap-3 px-4 h-10 border-b border-white/[0.06] bg-[#161514]">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#c0554e]/55" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#c49a3c]/45" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4a9d6e]/45" />
                </div>
                {/* URL bar */}
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-1.5 bg-[#1f1e1c] border border-white/[0.06] rounded-md px-3 py-1 max-w-[220px] w-full">
                    <div className="w-2 h-2 rounded-full bg-[#c97a40]/60 shrink-0" />
                    <span className="text-[10px] text-[#4a4540] font-mono truncate">app.soldsync.io/monitor</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-white/[0.04]" />
                  <div className="w-4 h-4 rounded bg-white/[0.04]" />
                </div>
              </div>

              {/* App top bar */}
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.04] bg-[#1a1918]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#c97a40]/15 border border-[#c97a40]/20 flex items-center justify-center">
                    <RefreshCw className="w-2.5 h-2.5 text-[#c97a40]" />
                  </div>
                  <span className="text-xs font-bold text-[#7a7268]">SoldSync</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#c97a40] bg-[#c97a40]/10 border border-[#c97a40]/20 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c97a40] animate-pulse" />
                  Monitoring
                </div>
              </div>

              {/* Demo content */}
              <div className="flex justify-center px-2 pt-3 pb-2 bg-[#1a1916]">
                <SyncFlowDemo />
              </div>

              {/* Activity log strip — compact 2-row */}
              <div className="border-t border-white/[0.05] bg-[#161514] px-4 py-2.5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-[#3a3530]">Activity</p>
                  <span className="text-[9px] text-[#4a9d6e] font-mono">live</span>
                </div>
                <div className="space-y-1">
                  {[
                    { dot: '#4a9d6e', label: 'Etsy sale detected · Nike Air Max 90', time: '0s' },
                    { dot: '#c97a40', label: 'eBay + Shopify listings ended',         time: '2s' },
                  ].map((e, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: e.dot }} />
                      <span className="text-[10px] text-[#5a5450] flex-1 truncate">{e.label}</span>
                      <span className="text-[9px] text-[#3a3530] shrink-0 font-mono">{e.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile: show demo below text */}
        <div className="lg:hidden w-full border-t border-white/[0.05] py-10 px-6 flex flex-col items-center gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4a4540]">Live demo</p>
          <SyncFlowDemo />
        </div>

        <a href="#comparison" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[#3a3530] hover:text-[#6a6460] transition-colors animate-bounce">
          <ChevronDown className="w-5 h-5" />
        </a>
      </section>

      {/* ── MARQUEE ── */}
      <IntegrationMarquee />

      {/* ── COMPARISON ── */}
      <section id="comparison" className="py-24 border-t border-white/[0.05]">
        <div className={W}>
          <SectionHeader
            eyebrow="The problem"
            heading="An 8-minute window for disaster"
            sub="Polling tools check for sales every few minutes. That gap is all it takes for two buyers to claim the same item."
          />

          {/* Gap callout */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#c0554e]/30" />
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#c0554e]/20 bg-[#c0554e]/6">
              <XCircle className="w-3.5 h-3.5 text-[#c0554e]/70" />
              <span className="text-xs font-semibold text-[#c0554e]/80">Average polling gap: 5–15 minutes of exposure</span>
            </div>
            <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#c0554e]/30" />
          </div>

          <ComparisonSection />
        </div>
      </section>

      {/* ── FEATURES (BentoGrid) ── */}
      <BentoGrid />

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 border-t border-white/[0.05]">
        <div className={W}>
          <SectionHeader
            eyebrow="Setup"
            heading="Running in 5 minutes. Works forever."
            sub="Three steps. Zero ongoing effort. No polling, no maintenance, no manual anything."
          />
          <div className="grid md:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <div key={step.n} className="rounded-2xl border border-white/[0.07] bg-[#1e1d1b] p-7 relative overflow-hidden flex flex-col gap-5">
                {/* Big background step number */}
                <span
                  className="absolute top-3 right-5 text-[72px] font-black leading-none select-none pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.03)' }}
                >
                  {step.n}
                </span>

                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0"
                  style={{ backgroundColor: `${step.color}10`, borderColor: `${step.color}28` }}
                >
                  <step.Icon className="w-5 h-5" style={{ color: step.color }} />
                </div>

                {/* Step label */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border font-mono"
                    style={{ color: step.color, borderColor: `${step.color}28`, backgroundColor: `${step.color}10` }}
                  >
                    Step {i + 1}
                  </span>
                  <div className="h-px flex-1" style={{ backgroundColor: `${step.color}18` }} />
                </div>

                <div>
                  <h3 className="text-[15px] font-semibold text-[#f0ece6] mb-2 leading-snug">{step.title}</h3>
                  <p className="text-sm text-[#6a6460] leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 border-t border-white/[0.05]">
        <div className={W}>
          <SectionHeader
            eyebrow="Pricing"
            heading="Simple, honest pricing"
            sub="Start free for 7 days. Pick the plan that fits your volume. Upgrade or cancel anytime."
          />

          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl flex flex-col overflow-hidden transition-all ${
                  plan.highlight
                    ? 'border-2 border-[#c97a40]/40 bg-[#221f1b] shadow-[0_0_0_1px_rgba(201,122,64,0.1),0_16px_48px_rgba(0,0,0,0.5)]'
                    : 'border border-white/[0.07] bg-[#212120]'
                }`}
              >
                {/* Top accent line for highlighted plan */}
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c97a40]/60 to-transparent" />
                )}

                {/* Popular badge */}
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
                    <h3 className="text-base font-bold text-[#f0ece6] mb-1">{plan.name}</h3>
                    <p className="text-xs text-[#4a4540] leading-relaxed mb-5">{plan.description}</p>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold text-[#f0ece6]">{plan.price}</span>
                      <span className="text-[#4a4540] mb-1 text-sm">{plan.period}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border"
                        style={{ color: plan.accent, borderColor: `${plan.accent}30`, backgroundColor: `${plan.accent}10` }}>
                        {plan.syncs}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border"
                        style={{ color: plan.accent, borderColor: `${plan.accent}30`, backgroundColor: `${plan.accent}10` }}>
                        {plan.platforms}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6 flex-1">
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

                  <Link
                    href="/auth?tab=signup"
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                      plan.highlight
                        ? 'bg-[#c97a40] hover:bg-[#b86c34] text-white'
                        : 'bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-[#b8b0a6]'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[#4a4540] mt-6">
            All plans include a 7-day free trial. No credit card required to start.
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <Testimonials />

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 border-t border-white/[0.05]">
        <div className={W}>
          <SectionHeader
            eyebrow="Questions"
            heading="Frequently asked"
            sub="If your question isn't here, email us at support@soldsync.app."
          />
          <div className="space-y-2.5 max-w-3xl mx-auto">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-white/[0.07] bg-[#1e1d1b] px-6 py-4 cursor-pointer hover:border-white/[0.12] transition-colors">
                <summary className="flex items-start justify-between gap-4 font-semibold text-[#c8c2bb] list-none text-[14px] leading-snug">
                  <span>{q}</span>
                  <ChevronDown className="w-4 h-4 text-[#4a4540] group-open:rotate-180 transition-transform shrink-0 mt-0.5" />
                </summary>
                <p className="mt-3 text-[13px] text-[#7a7268] leading-relaxed border-t border-white/[0.05] pt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-28 border-t border-white/[0.05] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#c97a40]/3 to-transparent" />
        </div>
        <div className={`relative ${W} text-center`}>
          <div className="inline-flex items-center gap-2 text-xs text-[#7a7268] mb-6 px-3 py-1.5 rounded-full border border-white/[0.07] bg-[#212120]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4a9d6e]" />
            The next double-sale is preventable
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Your item just sold.<br />
            <span className="text-gradient">It&apos;s already gone everywhere.</span>
          </h2>
          <p className="text-[#7a7268] mb-10 text-base max-w-md mx-auto">
            Join resellers who stopped apologising for double-sales and started selling with confidence.
          </p>
          <Link
            href="/auth?tab=signup"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#c97a40] hover:bg-[#b86c34] text-white font-medium text-base transition-all"
          >
            Get started free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="mt-4 text-xs text-[#4a4540]">No card required. Plans from $9.99/mo after 7-day trial.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.05] py-8">
        <div className={`${W} flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <span className="text-sm font-bold">
            Sold<span className="text-[#c97a40]">Sync</span>
          </span>
          <div className="flex items-center gap-6 text-xs text-[#4a4540]">
            <Link href="/privacy" className="hover:text-[#7a7268] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#7a7268] transition-colors">Terms</Link>
            <a href="mailto:support@soldsync.app" className="hover:text-[#7a7268] transition-colors">support@soldsync.app</a>
          </div>
          <p className="text-xs text-[#2e2c28]">© {new Date().getFullYear()} SoldSync</p>
        </div>
      </footer>

    </div>
  )
}
