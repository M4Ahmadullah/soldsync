/**
 * SoldSync — Supabase Database Migration Script
 * Run once: node scripts/migrate.mjs
 *
 * Applies all table definitions from docs/02-ARCHITECTURE.md
 * Uses the service role key to bypass RLS for DDL operations.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xuiykqxdwnzstqkzdavl.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aXlrcXhkd256c3Rxa3pkYXZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzgwMzU1NiwiZXhwIjoyMDg5Mzc5NTU2fQ.zu9zl81LlPhJT6E5XpvHivb-hKfHie4VQ5zEFqqKXz4'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Each migration is a named SQL block — idempotent (IF NOT EXISTS everywhere)
const migrations = [
  {
    name: '001_enable_extensions',
    sql: `
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `,
  },
  {
    name: '002_profiles',
    sql: `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        stripe_customer_id TEXT UNIQUE,
        stripe_subscription_id TEXT UNIQUE,
        subscription_status TEXT NOT NULL DEFAULT 'inactive',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_select_own'
        ) THEN
          CREATE POLICY "profiles_select_own" ON public.profiles
            FOR SELECT USING (auth.uid() = id);
        END IF;
      END $$;

      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_update_own'
        ) THEN
          CREATE POLICY "profiles_update_own" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
        END IF;
      END $$;

      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, email)
        VALUES (NEW.id, NEW.email)
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `,
  },
  {
    name: '003_connections',
    sql: `
      CREATE TABLE IF NOT EXISTS public.connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        platform TEXT NOT NULL CHECK (platform IN ('ebay', 'etsy', 'depop', 'poshmark')),
        platform_user_id TEXT NOT NULL,
        platform_username TEXT,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_expires_at TIMESTAMPTZ,
        webhook_id TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, platform)
      );

      ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename='connections' AND policyname='connections_all_own'
        ) THEN
          CREATE POLICY "connections_all_own" ON public.connections
            FOR ALL USING (auth.uid() = user_id);
        END IF;
      END $$;

      CREATE INDEX IF NOT EXISTS idx_connections_user ON public.connections(user_id);
      CREATE INDEX IF NOT EXISTS idx_connections_platform_user ON public.connections(platform, platform_user_id);
    `,
  },
  {
    name: '004_sync_logs',
    sql: `
      CREATE TABLE IF NOT EXISTS public.sync_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        source_platform TEXT NOT NULL,
        target_platform TEXT NOT NULL,
        listing_title TEXT NOT NULL,
        source_listing_id TEXT,
        target_listing_id TEXT,
        status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'no_match')),
        error_message TEXT,
        delist_latency_ms INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename='sync_logs' AND policyname='sync_logs_select_own'
        ) THEN
          CREATE POLICY "sync_logs_select_own" ON public.sync_logs
            FOR SELECT USING (auth.uid() = user_id);
        END IF;
      END $$;

      CREATE INDEX IF NOT EXISTS idx_sync_logs_user_created
        ON public.sync_logs(user_id, created_at DESC);
    `,
  },
  {
    name: '005_webhook_events',
    sql: `
      CREATE TABLE IF NOT EXISTS public.webhook_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        platform TEXT NOT NULL,
        event_type TEXT,
        raw_payload JSONB NOT NULL,
        signature_valid BOOLEAN,
        processed BOOLEAN NOT NULL DEFAULT FALSE,
        qstash_message_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_webhook_events_platform
        ON public.webhook_events(platform, created_at DESC);
    `,
  },
]

async function runMigrations() {
  console.log('🚀 SoldSync — Running Supabase Migrations\n')

  for (const migration of migrations) {
    process.stdout.write(`  Running ${migration.name}... `)
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: migration.sql })

      if (error) {
        // Try direct REST approach for DDL
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            apikey: SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({ sql: migration.sql }),
        })

        if (!res.ok) {
          const text = await res.text()
          // exec_sql RPC might not exist yet — that's OK, we use pg REST directly
          console.log(`⚠  (will apply via SQL editor — see output below)`)
          console.log(`   SQL: ${migration.sql.slice(0, 80)}...\n`)
          continue
        }
      }

      console.log('✓')
    } catch (err) {
      console.log(`⚠  ${err instanceof Error ? err.message : err}`)
    }
  }

  // Verify tables exist by querying them
  console.log('\n📋 Verifying tables...')
  const tables = ['profiles', 'connections', 'sync_logs', 'webhook_events']
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1)
    if (error && error.code !== 'PGRST116') {
      console.log(`  ✗ ${table}: ${error.message}`)
    } else {
      console.log(`  ✓ ${table}`)
    }
  }

  console.log('\n✅ Migration complete. Run the SQL blocks manually in Supabase SQL Editor if any showed ⚠\n')
  console.log('📌 Supabase SQL Editor: https://supabase.com/dashboard/project/xuiykqxdwnzstqkzdavl/sql\n')
}

runMigrations().catch(console.error)
