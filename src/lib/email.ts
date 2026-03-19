import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(params: { email: string }): Promise<void> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'MISSING_from_resend_dashboard') {
    console.log('[MOCK EMAIL] Welcome email to:', params.email)
    return
  }

  await resend.emails.send({
    from: 'Ahmad at SoldSync <hello@soldsync.app>',
    to: params.email,
    subject: 'Welcome to SoldSync — your listings are protected',
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#0A0A0B;color:#ededed;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#6366f1,#a78bfa);padding:40px 40px 32px">
          <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff">Welcome to SoldSync</h1>
          <p style="margin:12px 0 0;font-size:15px;color:rgba(255,255,255,0.8)">You're one step away from never having a double-sale again.</p>
        </div>
        <div style="padding:32px 40px">
          <p style="margin:0 0 24px;color:#a1a1aa;font-size:14px;line-height:1.6">
            Connect your stores and SoldSync will automatically delist sold items across all your platforms — in real time.
          </p>
          <div style="margin-bottom:24px">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <div style="width:32px;height:32px;border-radius:50%;background:#6366f1;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:13px">1</div>
              <div>
                <p style="margin:0;font-weight:600;color:#ededed;font-size:14px">Connect your platforms</p>
                <p style="margin:2px 0 0;color:#71717a;font-size:12px">Shopify, eBay, and Etsy — all in one dashboard</p>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <div style="width:32px;height:32px;border-radius:50%;background:#6366f1;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:13px">2</div>
              <div>
                <p style="margin:0;font-weight:600;color:#ededed;font-size:14px">Sell anything, anywhere</p>
                <p style="margin:2px 0 0;color:#71717a;font-size:12px">SoldSync watches every platform in real time</p>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:32px;height:32px;border-radius:50%;background:#10b981;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:13px">✓</div>
              <div>
                <p style="margin:0;font-weight:600;color:#ededed;font-size:14px">Never oversell again</p>
                <p style="margin:2px 0 0;color:#71717a;font-size:12px">Auto-delist fires in under 2 seconds from the sale</p>
              </div>
            </div>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a78bfa);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
            Open Your Dashboard →
          </a>
          <p style="margin:24px 0 0;color:#52525b;font-size:12px">Questions? Reply to this email — we read every one.</p>
        </div>
      </div>
    `,
  })
}

export async function sendNoMatchAlert(params: {
  email: string
  listingTitle: string
  sourcePlatform: string
  targetPlatform: string
}): Promise<void> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'MISSING_from_resend_dashboard') {
    console.warn('[MOCK EMAIL] No-match alert:', params)
    return
  }

  await resend.emails.send({
    from: 'SoldSync Alerts <alerts@soldsync.app>',
    to: params.email,
    subject: `⚠️ No match found — "${params.listingTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#d97706">SoldSync — No Match Found</h2>
        <p>A sale happened on <strong>${params.sourcePlatform}</strong> but we couldn't find a matching listing on <strong>${params.targetPlatform}</strong> to delist.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;font-weight:bold;width:160px">Sold on:</td><td style="padding:8px">${params.sourcePlatform}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Checked on:</td><td style="padding:8px">${params.targetPlatform}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Listing title:</td><td style="padding:8px">${params.listingTitle}</td></tr>
        </table>
        <p>This usually means the listing was already removed or has a different title on ${params.targetPlatform}. No action needed if it's already gone.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Open Dashboard</a>
      </div>
    `,
  })
}

export async function sendDelistFailureAlert(params: {
  email: string
  listingTitle: string
  sourcePlatform: string
  targetPlatform: string
  errorMessage: string
}): Promise<void> {
  // ── MOCK: log to console if Resend key not set ──
  if (!process.env.RESEND_API_KEY) {
    console.warn('[MOCK EMAIL] Delist failure alert:', params)
    return
  }

  await resend.emails.send({
    from: 'SoldSync Alerts <alerts@soldsync.app>',
    to: params.email,
    subject: `⚠️ Delist failed — "${params.listingTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#dc2626">SoldSync — Delist Failed</h2>
        <p>A delist action failed and may require your immediate attention to prevent a double-sale.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;font-weight:bold;width:160px">Item sold on:</td><td style="padding:8px">${params.sourcePlatform}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Failed to delist on:</td><td style="padding:8px">${params.targetPlatform}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Listing title:</td><td style="padding:8px">${params.listingTitle}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Error:</td><td style="padding:8px;color:#dc2626">${params.errorMessage}</td></tr>
        </table>
        <p><strong>Action required:</strong> Manually delist this item on ${params.targetPlatform} immediately.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Open Dashboard</a>
      </div>
    `,
  })
}

export async function sendWeeklyDigest(params: {
  email: string
  weekStart: string
  stats: {
    total: number
    successes: number
    failures: number
    noMatches: number
    successRate: number
    avgLatencyMs: number
  }
}): Promise<void> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'MISSING_from_resend_dashboard') {
    console.log('[MOCK EMAIL] Weekly digest to:', params.email, params.stats)
    return
  }

  const { stats } = params
  const weekOf = new Date(params.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const statusColor = stats.successRate >= 90 ? '#10b981' : stats.successRate >= 70 ? '#f59e0b' : '#ef4444'

  await resend.emails.send({
    from: 'SoldSync <hello@soldsync.app>',
    to: params.email,
    subject: `Your SoldSync weekly report — ${stats.successes} doubles prevented`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#0A0A0B;color:#ededed;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#6366f1,#a78bfa);padding:40px 40px 32px">
          <p style="margin:0 0 4px;font-size:12px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:1px">Weekly Report · ${weekOf}</p>
          <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff">${stats.successes} double-sales prevented</h1>
        </div>
        <div style="padding:32px 40px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px">
            <div style="background:#18181a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px">
              <p style="margin:0;font-size:12px;color:#71717a">Total syncs</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:#fff">${stats.total}</p>
            </div>
            <div style="background:#18181a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px">
              <p style="margin:0;font-size:12px;color:#71717a">Success rate</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:${statusColor}">${stats.successRate}%</p>
            </div>
            <div style="background:#18181a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px">
              <p style="margin:0;font-size:12px;color:#71717a">Avg delist time</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:#fff">${stats.avgLatencyMs}ms</p>
            </div>
            <div style="background:#18181a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px">
              <p style="margin:0;font-size:12px;color:#71717a">Failed / No match</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:${stats.failures > 0 ? '#ef4444' : '#fff'}">${stats.failures} / ${stats.noMatches}</p>
            </div>
          </div>
          ${stats.failures > 0
            ? `<p style="background:#3f1515;border:1px solid #7f1d1d;border-radius:8px;padding:12px 16px;font-size:13px;color:#fca5a5;margin-bottom:20px">⚠️ ${stats.failures} sync failure${stats.failures > 1 ? 's' : ''} this week — check your dashboard for details.</p>`
            : `<p style="background:#0f2a1a;border:1px solid #14532d;border-radius:8px;padding:12px 16px;font-size:13px;color:#86efac;margin-bottom:20px">✅ Perfect week — no failures.</p>`
          }
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a78bfa);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">View Full Activity Log →</a>
          <p style="margin:24px 0 0;color:#52525b;font-size:11px">You're receiving this because weekly digests are enabled in your account. <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color:#6366f1">Manage preferences</a>.</p>
        </div>
      </div>
    `,
  })
}
