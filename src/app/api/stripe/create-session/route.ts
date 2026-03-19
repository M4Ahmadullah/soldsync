import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// Map plan names to env var price IDs
const PRICE_MAP: Record<string, string | undefined> = {
  basic:   process.env.STRIPE_PRICE_BASIC,
  growth:  process.env.STRIPE_PRICE_GROWTH,
  pro:     process.env.STRIPE_PRICE_PRO,
  // Legacy single-plan fallback
  default: process.env.STRIPE_PRICE_PRO ?? process.env.STRIPE_PRICE_ID,
}

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Accept optional { plan: 'starter' | 'pro' | 'scale' } in body
  let plan = 'default'
  try {
    const body = await request.json()
    if (body?.plan && PRICE_MAP[body.plan]) plan = body.plan
  } catch { /* no body / not JSON — use default */ }

  const priceId = PRICE_MAP[plan] ?? PRICE_MAP.default
  if (!priceId) {
    return NextResponse.json({ error: 'Stripe price not configured for this plan' }, { status: 503 })
  }

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await service.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 7,
      metadata: { plan },
    },
  })

  return NextResponse.json({ url: session.url })
}
