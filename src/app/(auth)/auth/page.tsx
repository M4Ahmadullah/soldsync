'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login'

  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
          },
        })
        if (error) throw error
        setSignupSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (signupSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1916] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl bg-[#4a9d6e]/15 border border-[#4a9d6e]/25 p-5">
              <CheckCircle2 className="h-8 w-8 text-[#4a9d6e]" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-[#f0ece6]">Check your email</h2>
          <p className="mt-2 text-sm text-[#7a7268] leading-relaxed">
            We sent a confirmation link to <span className="text-[#b8b0a6] font-medium">{email}</span>.{' '}
            Click it to activate your account, then sign in.
          </p>
          <button
            onClick={() => { setSignupSuccess(false); setTab('login') }}
            className="mt-6 text-sm text-[#c97a40] hover:text-[#e8a060] transition-colors"
          >
            Back to sign in →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1916] px-4">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#c97a40]/4 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 text-[28px] font-bold tracking-tight text-[#f0ece6]">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 flex-shrink-0">
              <path d="M8 14L14 20L14 8" stroke="#c97a40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M24 18L18 12L18 24" stroke="#4a9d6e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="16" cy="16" r="2.5" fill="#f0ece6"/>
            </svg>
            <span>Sold<span className="text-[#c97a40]">Sync</span></span>
          </Link>
          <p className="mt-2 text-sm text-[#7a7268]">
            {tab === 'login' ? 'Welcome back.' : 'Start your free 7-day trial.'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#212120] p-8 shadow-[0_4px_32px_rgba(0,0,0,0.4)]">
          {/* Tabs */}
          <div className="mb-6 flex rounded-lg bg-[#1a1916] p-1 gap-1">
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={cn(
                  'flex-1 rounded-md py-1.5 text-sm font-medium transition-all duration-150',
                  tab === t
                    ? 'bg-[#2a2927] text-[#f0ece6] shadow-sm'
                    : 'text-[#7a7268] hover:text-[#b8b0a6]'
                )}
              >
                {t === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#b8b0a6] uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-white/[0.08] bg-[#1a1916] px-3 py-2.5 text-sm text-[#f0ece6] placeholder:text-[#4a4540] focus:border-[#c97a40]/50 focus:outline-none focus:ring-1 focus:ring-[#c97a40]/30 transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#b8b0a6] uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-white/[0.08] bg-[#1a1916] px-3 py-2.5 pr-10 text-sm text-[#f0ece6] placeholder:text-[#4a4540] focus:border-[#c97a40]/50 focus:outline-none focus:ring-1 focus:ring-[#c97a40]/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4540] hover:text-[#7a7268] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {tab === 'login' && (
              <div className="flex justify-end -mt-1">
                <Link href="/reset" className="text-xs text-[#4a4540] hover:text-[#7a7268] underline transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}

            {error && (
              <p className="rounded-lg border border-[#c0554e]/20 bg-[#c0554e]/10 px-3 py-2.5 text-sm text-[#e8857e]">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tab === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          {tab === 'signup' && (
            <p className="mt-4 text-center text-xs text-[#4a4540]">
              By signing up you agree to our{' '}
              <Link href="/terms" className="text-[#7a7268] hover:text-[#b8b0a6] transition-colors underline underline-offset-2">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-[#7a7268] hover:text-[#b8b0a6] transition-colors underline underline-offset-2">Privacy Policy</Link>.
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[#4a4540]">
          {tab === 'login' ? (
            <>No account?{' '}<button onClick={() => setTab('signup')} className="text-[#7a7268] hover:text-[#c97a40] transition-colors">Sign up free</button></>
          ) : (
            <>Already have an account?{' '}<button onClick={() => setTab('login')} className="text-[#7a7268] hover:text-[#c97a40] transition-colors">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#1a1916]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-[#c97a40]" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
