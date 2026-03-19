import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// DELETE /api/account/delete
// Permanently deletes the authenticated user's account and all their data.
// Cascade deletes handle: connections, sync_logs, price_sync_logs, stock_snapshots.
// Stripe subscription is NOT automatically cancelled here — user should cancel via portal first,
// or we rely on Stripe's webhook to handle cleanup if subscription lapses.
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()

  // Delete all user data (cascade handles child tables)
  // profiles, connections, sync_logs, price_sync_logs, stock_snapshots all have ON DELETE CASCADE
  await service.from('profiles').delete().eq('id', user.id)

  // Delete the auth.users record — this cascades everything
  const { error } = await service.auth.admin.deleteUser(user.id)
  if (error) {
    console.error('[AccountDelete] Failed to delete auth user:', error.message)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
