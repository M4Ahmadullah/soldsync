-- =====================================================
-- SoldSync — Complete Database Schema
-- Paste this entire file into:
-- https://supabase.com/dashboard/project/xuiykqxdwnzstqkzdavl/sql
-- Run it once. It is fully idempotent (safe to re-run).
-- =====================================================

-- 001: Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 002: Profiles (extends Supabase auth.users)
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
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_select_own') THEN
    CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_update_own') THEN
    CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Auto-create profile row when a new user signs up
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

-- 003: Connections (stores encrypted OAuth tokens per platform)
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('shopify', 'ebay', 'etsy', 'depop', 'poshmark', 'mercari', 'vinted')),
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  webhook_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_webhook_at TIMESTAMPTZ,
  webhook_last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='connections' AND policyname='connections_all_own') THEN
    CREATE POLICY "connections_all_own" ON public.connections FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_connections_user ON public.connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_platform_user ON public.connections(platform, platform_user_id);

-- Add new columns to existing connections table (idempotent)
ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS last_webhook_at TIMESTAMPTZ;
ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS webhook_last_verified_at TIMESTAMPTZ;

-- Fix platform CHECK constraint to include shopify (drop and recreate)
DO $$ BEGIN
  ALTER TABLE public.connections DROP CONSTRAINT IF EXISTS connections_platform_check;
  ALTER TABLE public.connections ADD CONSTRAINT connections_platform_check
    CHECK (platform IN ('shopify', 'ebay', 'etsy', 'depop', 'poshmark', 'mercari', 'vinted'));
EXCEPTION WHEN others THEN NULL;
END $$;

-- 004: Sync Logs (immutable record of every sync event)
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
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sync_logs' AND policyname='sync_logs_select_own') THEN
    CREATE POLICY "sync_logs_select_own" ON public.sync_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sync_logs_user_created ON public.sync_logs(user_id, created_at DESC);

-- 005: Webhook Events (raw inbound webhook log — internal only, no RLS)
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

CREATE INDEX IF NOT EXISTS idx_webhook_events_platform ON public.webhook_events(platform, created_at DESC);

-- 006: Price Sync Logs
CREATE TABLE IF NOT EXISTS public.price_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_platform TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  old_price NUMERIC(10,2),
  new_price NUMERIC(10,2) NOT NULL,
  targets_updated JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed', 'no_match')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.price_sync_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='price_sync_logs' AND policyname='price_sync_logs_select_own') THEN
    CREATE POLICY "price_sync_logs_select_own" ON public.price_sync_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_price_sync_logs_user ON public.price_sync_logs(user_id, created_at DESC);

-- 007: Stock Snapshots (daily low-stock tracking)
CREATE TABLE IF NOT EXISTS public.stock_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  alerted BOOLEAN NOT NULL DEFAULT FALSE,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stock_snapshots ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='stock_snapshots' AND policyname='stock_snapshots_select_own') THEN
    CREATE POLICY "stock_snapshots_select_own" ON public.stock_snapshots FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_stock_snapshots_user ON public.stock_snapshots(user_id, platform, listing_id);

-- 008: Notification preferences column (with full defaults including low stock)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB NOT NULL DEFAULT '{
    "email_on_failure": true,
    "email_on_no_match": false,
    "email_weekly_digest": false,
    "email_on_low_stock": true,
    "low_stock_threshold": 2,
    "price_sync_enabled": false
  }'::jsonb;

-- Done.
SELECT 'Schema applied successfully' AS status;
