import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Terms of Service — SoldSync' }

const EFFECTIVE = 'March 19, 2026'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#1a1916] text-[#f0ece6]">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#1a1916]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-6">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-[#7a7268] hover:text-[#b8b0a6] transition-colors">
            <ArrowLeft className="h-4 w-4" /> SoldSync
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14 prose prose-invert prose-sm max-w-none">
        <h1 className="text-3xl font-bold text-[#f0ece6] mb-2">Terms of Service</h1>
        <p className="text-[#4a4540] text-sm mb-10">Effective: {EFFECTIVE}</p>

        <Section title="1. Acceptance of Terms">
          By creating an account or using SoldSync (&quot;Service&quot;, &quot;we&quot;, &quot;us&quot;), you agree to these Terms. If you disagree, do not use the Service.
        </Section>

        <Section title="2. Description of Service">
          SoldSync is a cross-listing synchronisation tool that automatically removes (&quot;delists&quot;) product listings from connected marketplaces (Shopify, eBay, Etsy) when a sale occurs on any connected platform. The Service is designed to prevent duplicate sales (double-sales) for resellers.
        </Section>

        <Section title="3. Subscription and Billing">
          SoldSync is a paid subscription service at $19.99/month after a 7-day free trial. Billing is handled by Stripe. You may cancel at any time through the Stripe Customer Portal; access continues until the end of the current billing period. No refunds are issued for partial periods.
        </Section>

        <Section title="4. Platform Connections and OAuth">
          By connecting a marketplace account, you grant SoldSync permission to read your active listings and remove listings on your behalf. SoldSync will only perform actions required to deliver the Service. You may disconnect a platform at any time from the dashboard.
        </Section>

        <Section title="5. Limitations">
          SoldSync performs best-effort title matching (Jaro-Winkler ≥90% similarity). We do not guarantee a delist will succeed if: (a) the listing title differs significantly across platforms, (b) a platform API is unavailable, or (c) OAuth tokens expire and cannot be refreshed. You remain responsible for monitoring your listings and acting on failure alerts.
        </Section>

        <Section title="6. Acceptable Use">
          You may not use the Service to violate any marketplace&apos;s terms of service, transmit malware, or interfere with SoldSync infrastructure. We reserve the right to suspend accounts found in violation.
        </Section>

        <Section title="7. Data and Privacy">
          OAuth access tokens are stored AES-256-GCM encrypted. We do not sell your data. See our Privacy Policy for full details.
        </Section>

        <Section title="8. Disclaimer of Warranties">
          The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee uninterrupted operation or that every double-sale will be prevented.
        </Section>

        <Section title="9. Limitation of Liability">
          To the maximum extent permitted by law, SoldSync&apos;s liability for any claim arising from use of the Service is limited to the amount you paid in the 30 days preceding the claim.
        </Section>

        <Section title="10. Changes">
          We may update these Terms. Continued use after notice of changes constitutes acceptance.
        </Section>

        <Section title="11. Contact">
          Questions? Email us at <a href="mailto:support@soldsync.app" className="text-[#c97a40] hover:underline">support@soldsync.app</a>.
        </Section>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-[#f0ece6] mb-2">{title}</h2>
      <p className="text-sm text-[#7a7268] leading-relaxed">{children}</p>
    </div>
  )
}
