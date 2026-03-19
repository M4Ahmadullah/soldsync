import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ── Shared brand colours ──────────────────────────────────────────────────
const AMBER = '#c97a40'
const GREEN = '#4a9d6e'
const BG    = '#141210'
const CARD  = '#1e1d1b'
const TEXT  = '#e8e2db'
const MUTED = '#7a7268'

function baseLayout(inner: string) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:${BG};color:${TEXT};border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06)">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,${AMBER},#b86c34);padding:36px 40px 28px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px">Sold<span style="color:rgba(255,255,255,0.75)">Sync</span></span>
        </div>
        ${inner}
      </div>
      <div id="body-slot"></div>
      <!-- Footer -->
      <div style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06)">
        <p style="margin:0;font-size:11px;color:#52524e">© ${new Date().getFullYear()} SoldSync · XEQUTIVE TECH LTD · <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color:${MUTED}">Privacy</a></p>
      </div>
    </div>
  `
}

function card(content: string) {
  return `<div style="background:${CARD};border-radius:12px;padding:20px 24px;margin-bottom:16px;border:1px solid rgba(255,255,255,0.06)">${content}</div>`
}

function btn(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:${AMBER};color:#fff;padding:13px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-top:8px">${label} →</a>`
}

function statGrid(items: Array<{ label: string; value: string; color?: string }>) {
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">${items.map(it =>
    `<div style="background:${CARD};border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px 16px">
       <p style="margin:0;font-size:11px;color:${MUTED}">${it.label}</p>
       <p style="margin:4px 0 0;font-size:24px;font-weight:700;color:${it.color ?? TEXT}">${it.value}</p>
     </div>`
  ).join('')}</div>`
}

// ── Emails ─────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(params: { email: string }): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[MOCK EMAIL] Welcome email to:', params.email)
    return
  }

  const steps = [
    { n: '1', title: 'Connect your platforms', sub: 'Shopify, eBay, and Etsy — under 2 minutes' },
    { n: '2', title: 'Keep listing normally', sub: 'SoldSync watches every platform silently' },
    { n: '✓', title: 'Never oversell again', sub: 'Auto-delist fires within 2 seconds of any sale', ok: true },
  ]

  await resend.emails.send({
    from: 'Ahmad at SoldSync <hello@soldsync.app>',
    to: params.email,
    subject: 'Welcome to SoldSync — your listings are now protected',
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:${BG};color:${TEXT};border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06)">
        <div style="background:linear-gradient(135deg,${AMBER},#b86c34);padding:36px 40px 28px">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:1.5px">Welcome to</p>
          <h1 style="margin:0;font-size:30px;font-weight:800;color:#fff">SoldSync</h1>
          <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.8)">You're one step away from never having a double-sale again.</p>
        </div>
        <div style="padding:32px 40px">
          <p style="margin:0 0 24px;color:${MUTED};font-size:14px;line-height:1.6">Connect your stores and SoldSync will automatically delist sold items across all your platforms — in real time. Here's how it works:</p>
          ${steps.map(s => `
            <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px">
              <div style="width:32px;height:32px;border-radius:50%;background:${s.ok ? GREEN : AMBER};display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:13px;flex-shrink:0">${s.n}</div>
              <div>
                <p style="margin:0;font-weight:600;color:${TEXT};font-size:14px">${s.title}</p>
                <p style="margin:2px 0 0;color:${MUTED};font-size:12px">${s.sub}</p>
              </div>
            </div>
          `).join('')}
          ${btn('Open Your Dashboard', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)}
          <p style="margin:24px 0 0;color:#52524e;font-size:12px">Questions? Reply to this email — we read every one.</p>
        </div>
        <div style="padding:16px 40px;border-top:1px solid rgba(255,255,255,0.06)">
          <p style="margin:0;font-size:11px;color:#52524e">© ${new Date().getFullYear()} SoldSync · XEQUTIVE TECH LTD</p>
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
  if (!process.env.RESEND_API_KEY) {
    console.warn('[MOCK EMAIL] No-match alert:', params)
    return
  }

  await resend.emails.send({
    from: 'SoldSync Alerts <alerts@soldsync.app>',
    to: params.email,
    subject: `No match found — "${params.listingTitle}"`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:${BG};color:${TEXT};border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06)">
        <div style="background:linear-gradient(135deg,#b8860b,#8b6914);padding:32px 40px 24px">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:1.5px">SoldSync Alert</p>
          <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff">No Matching Listing Found</h1>
        </div>
        <div style="padding:28px 40px">
          <p style="color:${MUTED};font-size:14px;margin:0 0 20px;line-height:1.6">A sale was detected but we couldn't find a matching listing to delist on the target platform. Manual check may be needed.</p>
          ${card(`
            <p style="margin:0 0 10px;font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:1px">Details</p>
            <table style="width:100%;font-size:13px;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:${MUTED};width:140px">Sold on</td><td style="padding:6px 0;font-weight:600">${params.sourcePlatform}</td></tr>
              <tr><td style="padding:6px 0;color:${MUTED}">Checked on</td><td style="padding:6px 0;font-weight:600">${params.targetPlatform}</td></tr>
              <tr><td style="padding:6px 0;color:${MUTED}">Listing title</td><td style="padding:6px 0;font-weight:600">${params.listingTitle}</td></tr>
            </table>
          `)}
          <p style="color:${MUTED};font-size:13px;margin:0 0 20px">This usually means the listing was already removed or has a different title on ${params.targetPlatform}. No action needed if it's already gone.</p>
          ${btn('Open Dashboard', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)}
        </div>
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
  if (!process.env.RESEND_API_KEY) {
    console.warn('[MOCK EMAIL] Delist failure alert:', params)
    return
  }

  await resend.emails.send({
    from: 'SoldSync Alerts <alerts@soldsync.app>',
    to: params.email,
    subject: `ACTION REQUIRED — Delist failed for "${params.listingTitle}"`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:${BG};color:${TEXT};border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06)">
        <div style="background:linear-gradient(135deg,#c0392b,#96281b);padding:32px 40px 24px">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:1.5px">Urgent — SoldSync Alert</p>
          <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff">Delist Action Failed</h1>
        </div>
        <div style="padding:28px 40px">
          <p style="color:${MUTED};font-size:14px;margin:0 0 20px;line-height:1.6">A delist action failed. Manually remove this listing immediately to prevent a double-sale.</p>
          ${card(`
            <p style="margin:0 0 10px;font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:1px">Details</p>
            <table style="width:100%;font-size:13px;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:${MUTED};width:140px">Item sold on</td><td style="padding:6px 0;font-weight:600">${params.sourcePlatform}</td></tr>
              <tr><td style="padding:6px 0;color:${MUTED}">Failed on</td><td style="padding:6px 0;font-weight:600">${params.targetPlatform}</td></tr>
              <tr><td style="padding:6px 0;color:${MUTED}">Listing</td><td style="padding:6px 0;font-weight:600">${params.listingTitle}</td></tr>
              <tr><td style="padding:6px 0;color:${MUTED}">Error</td><td style="padding:6px 0;color:#e05c4b;font-family:monospace;font-size:12px">${params.errorMessage}</td></tr>
            </table>
          `)}
          ${btn('Go to Dashboard', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)}
        </div>
      </div>
    `,
  })
}

export async function sendWebhookReregistrationAlert(params: {
  email: string
  platform: string
  error: string
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[MOCK EMAIL] Webhook re-registration alert:', params)
    return
  }

  await resend.emails.send({
    from: 'SoldSync Alerts <alerts@soldsync.app>',
    to: params.email,
    subject: `${params.platform} webhook re-registration failed — reconnect needed`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:${BG};color:${TEXT};border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06)">
        <div style="background:linear-gradient(135deg,#b8860b,#8b6914);padding:32px 40px 24px">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:1.5px">SoldSync Watchdog</p>
          <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff">${params.platform} Webhook Failed</h1>
        </div>
        <div style="padding:28px 40px">
          <p style="color:${MUTED};font-size:14px;margin:0 0 20px;line-height:1.6">The daily webhook watchdog could not re-register your <strong style="color:${TEXT}">${params.platform}</strong> webhook. Your auto-sync may have stopped — reconnect to restore it.</p>
          ${card(`<p style="margin:0;font-family:monospace;font-size:12px;color:#c9a96e;word-break:break-all">${params.error}</p>`)}
          <p style="color:${MUTED};font-size:13px;margin:0 0 20px">Go to your dashboard and reconnect your ${params.platform} account to restore automatic syncing.</p>
          ${btn('Reconnect Now', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)}
        </div>
      </div>
    `,
  })
}

export async function sendLowStockAlert(params: {
  email: string
  items: Array<{ title: string; quantity: number; platform: string; platformCount: number }>
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[MOCK EMAIL] Low stock alert:', params)
    return
  }

  const rows = params.items.map((item) =>
    `<tr style="border-top:1px solid rgba(255,255,255,0.05)">
       <td style="padding:10px 0;font-size:13px;color:${TEXT}">${item.title}</td>
       <td style="padding:10px 8px;font-size:13px;color:${AMBER};font-weight:700;white-space:nowrap">${item.quantity} left</td>
       <td style="padding:10px 0;font-size:13px;color:${MUTED}">${item.platform}</td>
       <td style="padding:10px 0;font-size:13px;color:${MUTED}">${item.platformCount} platforms</td>
     </tr>`
  ).join('')

  await resend.emails.send({
    from: 'SoldSync Alerts <alerts@soldsync.app>',
    to: params.email,
    subject: `Low stock warning — ${params.items.length} item${params.items.length === 1 ? '' : 's'} at risk`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:${BG};color:${TEXT};border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06)">
        <div style="background:linear-gradient(135deg,${AMBER},#b86c34);padding:32px 40px 24px">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:1.5px">SoldSync — Low Stock Alert</p>
          <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff">${params.items.length} Item${params.items.length === 1 ? '' : 's'} Running Low</h1>
        </div>
        <div style="padding:28px 40px">
          <p style="color:${MUTED};font-size:14px;margin:0 0 20px;line-height:1.6">These items are low on stock and listed on multiple platforms. One more sale could trigger a race condition — consider reducing to a single platform until sold.</p>
          ${card(`
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr>
                  <th style="padding:0 0 10px;text-align:left;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:1px">Listing</th>
                  <th style="padding:0 8px 10px;text-align:left;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:1px">Qty</th>
                  <th style="padding:0 0 10px;text-align:left;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:1px">Platform</th>
                  <th style="padding:0 0 10px;text-align:left;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:1px">Exposure</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          `)}
          ${btn('View Dashboard', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)}
        </div>
      </div>
    `,
  })
}

export async function sendPriceSyncFailureAlert(params: {
  email: string
  listingTitle: string
  sourcePlatform: string
  targetPlatform: string
  newPrice: number
  errorMessage: string
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[MOCK EMAIL] Price sync failure alert:', params)
    return
  }

  await resend.emails.send({
    from: 'SoldSync Alerts <alerts@soldsync.app>',
    to: params.email,
    subject: `Price sync failed — "${params.listingTitle}"`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:${BG};color:${TEXT};border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06)">
        <div style="background:linear-gradient(135deg,#c0392b,#96281b);padding:32px 40px 24px">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:1.5px">SoldSync — Price Sync</p>
          <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff">Price Update Failed</h1>
        </div>
        <div style="padding:28px 40px">
          <p style="color:${MUTED};font-size:14px;margin:0 0 20px;line-height:1.6">A price change on ${params.sourcePlatform} could not be propagated to ${params.targetPlatform}. Update it manually to keep prices consistent.</p>
          ${card(`
            <table style="width:100%;font-size:13px;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:${MUTED};width:140px">Listing</td><td style="padding:6px 0;font-weight:600">${params.listingTitle}</td></tr>
              <tr><td style="padding:6px 0;color:${MUTED}">Updated on</td><td style="padding:6px 0;font-weight:600">${params.sourcePlatform}</td></tr>
              <tr><td style="padding:6px 0;color:${MUTED}">Failed on</td><td style="padding:6px 0;font-weight:600">${params.targetPlatform}</td></tr>
              <tr><td style="padding:6px 0;color:${MUTED}">New price</td><td style="padding:6px 0;font-weight:700;color:${GREEN}">$${params.newPrice.toFixed(2)}</td></tr>
              <tr><td style="padding:6px 0;color:${MUTED}">Error</td><td style="padding:6px 0;color:#e05c4b;font-family:monospace;font-size:12px">${params.errorMessage}</td></tr>
            </table>
          `)}
          ${btn('Open Dashboard', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)}
        </div>
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
  if (!process.env.RESEND_API_KEY) {
    console.log('[MOCK EMAIL] Weekly digest to:', params.email, params.stats)
    return
  }

  const { stats } = params
  const weekOf = new Date(params.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const rateColor = stats.successRate >= 90 ? GREEN : stats.successRate >= 70 ? AMBER : '#e05c4b'

  await resend.emails.send({
    from: 'SoldSync <hello@soldsync.app>',
    to: params.email,
    subject: `Your weekly SoldSync report — ${stats.successes} doubles prevented`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:${BG};color:${TEXT};border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06)">
        <div style="background:linear-gradient(135deg,${AMBER},#b86c34);padding:36px 40px 28px">
          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:1.5px">Weekly Report · ${weekOf}</p>
          <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff">${stats.successes} double-sales prevented</h1>
        </div>
        <div style="padding:32px 40px">
          ${statGrid([
            { label: 'Total syncs', value: String(stats.total) },
            { label: 'Success rate', value: `${stats.successRate}%`, color: rateColor },
            { label: 'Avg delist time', value: `${stats.avgLatencyMs}ms` },
            { label: 'Failures', value: String(stats.failures), color: stats.failures > 0 ? '#e05c4b' : TEXT },
          ])}
          ${stats.failures > 0
            ? `<div style="background:rgba(192,85,78,0.12);border:1px solid rgba(192,85,78,0.3);border-radius:10px;padding:14px 18px;font-size:13px;color:#f0a09a;margin-bottom:20px">⚠️ ${stats.failures} sync failure${stats.failures > 1 ? 's' : ''} this week — check your dashboard for details.</div>`
            : `<div style="background:rgba(74,157,110,0.12);border:1px solid rgba(74,157,110,0.3);border-radius:10px;padding:14px 18px;font-size:13px;color:#86d4a8;margin-bottom:20px">✓ Perfect week — no failures.</div>`
          }
          ${btn('View Full Activity Log', `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)}
          <p style="margin:24px 0 0;color:#52524e;font-size:11px">You're receiving this because weekly digests are enabled. <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color:${MUTED}">Manage preferences</a>.</p>
        </div>
        <div style="padding:16px 40px;border-top:1px solid rgba(255,255,255,0.06)">
          <p style="margin:0;font-size:11px;color:#52524e">© ${new Date().getFullYear()} SoldSync · XEQUTIVE TECH LTD</p>
        </div>
      </div>
    `,
  })
}
