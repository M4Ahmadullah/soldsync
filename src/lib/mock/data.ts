/**
 * MOCK DATA — replaces all Supabase, eBay, and Etsy calls
 * until real credentials are wired in.
 * Delete this file and swap imports when going live.
 */

export type Platform = 'ebay' | 'etsy'
export type SyncStatus = 'success' | 'failed' | 'no_match'

export interface MockConnection {
  id: string
  platform: Platform
  platform_username: string
  is_active: boolean
  connected_at: string
}

export interface MockSyncLog {
  id: string
  source_platform: Platform
  target_platform: Platform
  listing_title: string
  status: SyncStatus
  delist_latency_ms: number
  error_message: string | null
  created_at: string
}

export interface MockProfile {
  id: string
  email: string
  subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled'
  stripe_customer_id: string
}

// ─── Mock User ───────────────────────────────────────────────
export const MOCK_USER: MockProfile = {
  id: 'mock-user-001',
  email: 'reseller@example.com',
  subscription_status: 'active',
  stripe_customer_id: 'cus_mock123',
}

// ─── Mock Connections ────────────────────────────────────────
export const MOCK_CONNECTIONS: MockConnection[] = [
  {
    id: 'conn-001',
    platform: 'ebay',
    platform_username: 'vintage_finds_99',
    is_active: true,
    connected_at: '2026-03-10T09:00:00Z',
  },
  {
    id: 'conn-002',
    platform: 'etsy',
    platform_username: 'VintageThreadsCo',
    is_active: true,
    connected_at: '2026-03-10T09:05:00Z',
  },
]

// ─── Mock Sync Logs ──────────────────────────────────────────
export const MOCK_SYNC_LOGS: MockSyncLog[] = [
  {
    id: 'log-001',
    source_platform: 'etsy',
    target_platform: 'ebay',
    listing_title: "Vintage Levi's 501 Jeans W32 L30 Made in USA",
    status: 'success',
    delist_latency_ms: 847,
    error_message: null,
    created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: 'log-002',
    source_platform: 'ebay',
    target_platform: 'etsy',
    listing_title: '90s Carhartt Detroit Jacket Size Large Brown',
    status: 'success',
    delist_latency_ms: 1204,
    error_message: null,
    created_at: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
  },
  {
    id: 'log-003',
    source_platform: 'etsy',
    target_platform: 'ebay',
    listing_title: 'Ralph Lauren Polo Shirt Vintage 1990s XL Navy',
    status: 'no_match',
    delist_latency_ms: 512,
    error_message: 'No listing on eBay matched title within 90% threshold',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'log-004',
    source_platform: 'ebay',
    target_platform: 'etsy',
    listing_title: 'Nike Air Max 95 OG Neon Yellow Size 10',
    status: 'success',
    delist_latency_ms: 933,
    error_message: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'log-005',
    source_platform: 'etsy',
    target_platform: 'ebay',
    listing_title: 'Patagonia Fleece Jacket Vintage Synchilla M',
    status: 'failed',
    delist_latency_ms: 2100,
    error_message: 'eBay API error 403: Token expired. Reconnect your eBay account.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'log-006',
    source_platform: 'ebay',
    target_platform: 'etsy',
    listing_title: "Levi's Orange Tab Denim Jacket W Men's Medium",
    status: 'success',
    delist_latency_ms: 765,
    error_message: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  },
  {
    id: 'log-007',
    source_platform: 'etsy',
    target_platform: 'ebay',
    listing_title: 'Tommy Hilfiger Windbreaker 90s Red White Blue L',
    status: 'success',
    delist_latency_ms: 1055,
    error_message: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
]

// ─── Mock Stats ───────────────────────────────────────────────
export const MOCK_STATS = {
  totalSyncs: 143,
  successRate: 96.5,
  avgLatencyMs: 924,
  doublesSaved: 143,
}
