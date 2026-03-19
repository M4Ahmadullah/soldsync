import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      // Fetch the subscription to get real status (may be 'trialing' during trial)
      let subStatus = 'active'
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        subStatus = sub.status
      }
      await supabase.from('profiles').update({
        stripe_subscription_id: session.subscription as string,
        subscription_status: subStatus,
        updated_at: new Date().toISOString(),
      }).eq('stripe_customer_id', session.customer as string)
      break
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      await supabase.from('profiles').update({
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      }).eq('stripe_customer_id', invoice.customer as string)
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await supabase.from('profiles').update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString(),
      }).eq('stripe_customer_id', invoice.customer as string)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('profiles').update({
        subscription_status: 'canceled',
        updated_at: new Date().toISOString(),
      }).eq('stripe_customer_id', sub.customer as string)
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('profiles').update({
        subscription_status: sub.status,
        updated_at: new Date().toISOString(),
      }).eq('stripe_customer_id', sub.customer as string)
      break
    }
  }

  return NextResponse.json({ received: true })
}
