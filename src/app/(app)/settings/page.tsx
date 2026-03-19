import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, ExternalLink, Mail, LogOut, Bell, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { NotificationSettings } from '@/components/NotificationSettings'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, subscription_status')
    .eq('id', user.id)
    .single()

  const email = profile?.email ?? user.email ?? ''
  const status = profile?.subscription_status ?? 'inactive'
  const statusLabel =
    status === 'active' ? 'Active'
    : status === 'trialing' ? 'Trial'
    : status === 'past_due' ? 'Past due'
    : 'Inactive'

  const statusColor =
    status === 'active' || status === 'trialing'
      ? 'bg-[#4a9d6e]/15 text-[#4a9d6e] border border-[#4a9d6e]/25'
      : 'bg-[#c49a3c]/15 text-[#c49a3c] border border-[#c49a3c]/25'

  return (
    <div className="min-h-screen bg-[#1a1916]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#1a1916]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 flex-shrink-0">
              <path d="M8 14L14 20L14 8" stroke="#c97a40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M24 18L18 12L18 24" stroke="#4a9d6e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="16" cy="16" r="2.5" fill="#f0ece6"/>
            </svg>
            <span className="text-[22px] font-semibold text-[#f0ece6]">
              Sold<span className="text-[#c97a40]">Sync</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-5">
        <div className="pb-2">
          <h1 className="text-2xl font-bold text-[#f0ece6]">Settings</h1>
          <p className="mt-1 text-sm text-[#7a7268]">Manage your account, notifications, and billing.</p>
        </div>

        {/* Account */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#c97a40]" />
              <CardTitle className="text-sm">Account</CardTitle>
            </div>
            <CardDescription>Your SoldSync account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2a2927] border border-white/[0.08] text-[#f0ece6] text-sm font-bold shrink-0">
                {email[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#f0ece6] truncate">{email}</p>
                <p className="text-xs text-[#7a7268]">
                  {status === 'trialing' ? '7-day free trial active' : `Subscription: ${statusLabel}`}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
              <Mail className="h-4 w-4 text-[#4a4540]" />
              <span className="text-sm text-[#7a7268]">{email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#c97a40]" />
              <CardTitle className="text-sm">Notifications</CardTitle>
            </div>
            <CardDescription>
              Choose which email alerts you want to receive. Failure alerts are on by default
              — they&apos;re your last line of defence against double-sales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationSettings userId={user.id} />
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#c97a40]" />
              <CardTitle className="text-sm">Billing</CardTitle>
            </div>
            <CardDescription>
              Manage your subscription, update your payment method, or cancel.
              All billing is handled securely by Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#1a1916] p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#2a2927] border border-white/[0.06]">
                  <CreditCard className="h-4 w-4 text-[#7a7268]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#f0ece6]">SoldSync</p>
                  <p className="text-xs text-[#7a7268]">
                    {status === 'trialing' ? '7-day free trial · all features included' :
                     status === 'active'   ? 'Active subscription · Shopify, eBay & Etsy' :
                     status === 'past_due' ? 'Payment past due — update billing below' :
                     'No active subscription'}
                  </p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                {statusLabel}
              </span>
            </div>

            <form action="/api/stripe/portal" method="POST">
              <Button type="submit" variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Manage billing in Stripe
              </Button>
            </form>

            <p className="text-xs text-[#4a4540]">
              Cancel, update your card, or download invoices through the Stripe Customer Portal.
              Cancellations take effect at the end of the current billing period.
            </p>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-[#c0554e]/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm text-[#c0554e]">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions. Proceed with caution.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="outline" className="w-full text-[#7a7268] border-white/[0.06] hover:text-[#e8857e] hover:border-[#c0554e]/30 hover:bg-[#c0554e]/5">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
