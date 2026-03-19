'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SyncLogTable, type SyncLog } from './SyncLogTable'

interface Props {
  userId: string
  initialLogs: SyncLog[]
}

export function RealtimeSyncLogs({ userId, initialLogs }: Props) {
  const [logs, setLogs] = useState<SyncLog[]>(initialLogs)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('sync_logs_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sync_logs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newLog = payload.new as SyncLog
          setLogs((prev) => [newLog, ...prev].slice(0, 50))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return <SyncLogTable logs={logs} />
}
