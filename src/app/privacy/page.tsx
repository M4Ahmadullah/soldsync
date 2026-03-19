import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Privacy Policy — SoldSync' }

const EFFECTIVE = 'March 19, 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#1a1916] text-[#f0ece6]">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#1a1916]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-6">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-[#7a7268] hover:text-[#b8b0a6] transition-colors">
            <ArrowLeft className="h-4 w-4" /> SoldSync
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="text-3xl font-bold text-[#f0ece6] mb-2">Privacy Policy</h1>
        <p className="text-[#4a4540] text-sm mb-10">Effective: {EFFECTIVE}</p>

        <Section title="1. What We Collect">
          <ul>
            <li><strong>Account data:</strong> Your email address and encrypted password hash (managed by Supabase Auth).</li>
            <li><strong>OAuth tokens:</strong> Access and refresh tokens for connected platforms (Shopify, eBay, Etsy). All tokens are stored AES-256-GCM encrypted at rest and are never logged or exposed client-side.</li>
            <li><strong>Sync activity:</strong> Logs of sync events including listing title, source/target platform, status, and latency. Used to power your activity dashboard.</li>
            <li><strong>Billing data:</strong> Managed entirely by Stripe. We store only a Stripe customer ID and subscription status. We never see or store full card numbers.</li>
            <li><strong>Notification preferences:</strong> Your email alert settings.</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Data">
          <ul>
            <li>To deliver the sync service (detect sales, delist listings).</li>
            <li>To send transactional emails: welcome, sync failure alerts, no-match alerts, and optional weekly digests.</li>
            <li>To process billing through Stripe.</li>
            <li>To display your activity history in the dashboard.</li>
          </ul>
          We do not use your data for advertising. We do not sell your data to third parties.
        </Section>

        <Section title="3. Third-Party Services">
          <ul>
            <li><strong>Supabase</strong> — database and authentication hosting.</li>
            <li><strong>Stripe</strong> — payment processing.</li>
            <li><strong>Upstash QStash</strong> — async job queuing for sync processing.</li>
            <li><strong>Resend</strong> — transactional email delivery.</li>
            <li><strong>Vercel</strong> — application hosting.</li>
          </ul>
          Each of these services has its own privacy policy. We only share data with them as required to operate the Service.
        </Section>

        <Section title="4. Data Retention">
          Sync logs are retained for 90 days. OAuth tokens are deleted when you disconnect a platform or close your account. Account data is deleted within 30 days of account closure.
        </Section>

        <Section title="5. eBay Account Deletion">
          We comply with eBay&apos;s GDPR-aligned account deletion requirement. If you delete your eBay account, eBay will notify us and we will remove all associated connection data within 30 days.
        </Section>

        <Section title="6. Your Rights">
          You may request a copy of your data, correction, or deletion by emailing{' '}
          <a href="mailto:privacy@soldsync.app" className="text-[#c97a40] hover:underline">privacy@soldsync.app</a>.
          You may also delete your account at any time by contacting support.
        </Section>

        <Section title="7. Cookies">
          We use session cookies required for authentication. We do not use tracking or advertising cookies.
        </Section>

        <Section title="8. Security">
          OAuth tokens are encrypted with AES-256-GCM before storage. Database access is protected by Row Level Security (RLS) — each user can only access their own data. All connections use TLS.
        </Section>

        <Section title="9. Changes">
          We will notify you of material changes to this policy by email or in-app notice.
        </Section>

        <Section title="10. Contact">
          <a href="mailto:privacy@soldsync.app" className="text-[#c97a40] hover:underline">privacy@soldsync.app</a>
        </Section>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-[#f0ece6] mb-3">{title}</h2>
      <div className="text-sm text-[#7a7268] leading-relaxed [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:text-[#b8b0a6]">
        {children}
      </div>
    </div>
  )
}
