import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

// Supabase email confirmation — user clicks link in email, lands here
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | 'recovery' | null

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/auth?error=invalid_link', request.url))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ token_hash, type })

  if (error) {
    return NextResponse.redirect(new URL('/auth?error=confirmation_failed', request.url))
  }

  // After confirming email, send to /subscribe if new user, /dashboard if existing subscriber
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth', request.url))

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, email')
    .eq('id', user.id)
    .single()

  // Send welcome email only on initial email confirmation (type = 'email')
  if (type === 'email' && (profile?.email ?? user.email)) {
    await sendWelcomeEmail({ email: profile?.email ?? user.email! }).catch(() => null)
  }

  const status = profile?.subscription_status
  if (status && ['active', 'trialing', 'past_due'].includes(status)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.redirect(new URL('/subscribe', request.url))
}
