import { createClient } from '@supabase/supabase-js'

// WARNING: Service role client bypasses Row Level Security.
// ONLY import this in server-side API routes — NEVER in client components.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
