#!/bin/bash
# Run this AFTER: vercel link
# Sets all production env vars from .env.local into Vercel

set -e
cd "$(dirname "$0")/.."

echo "📦 Pushing env vars to Vercel..."

push_env() {
  local KEY=$1
  local VALUE=$2
  local SCOPE=${3:-"production preview development"}
  echo "$VALUE" | vercel env add "$KEY" production --force 2>/dev/null || true
  echo "$VALUE" | vercel env add "$KEY" preview --force 2>/dev/null || true
  echo "  ✓ $KEY"
}

# Load from .env.local
source .env.local 2>/dev/null || true

push_env NEXT_PUBLIC_SUPABASE_URL "$NEXT_PUBLIC_SUPABASE_URL"
push_env NEXT_PUBLIC_SUPABASE_ANON_KEY "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
push_env SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY"
push_env SUPABASE_TOKEN_ENCRYPTION_KEY "$SUPABASE_TOKEN_ENCRYPTION_KEY"
push_env QSTASH_URL "$QSTASH_URL"
push_env QSTASH_TOKEN "$QSTASH_TOKEN"
push_env QSTASH_CURRENT_SIGNING_KEY "$QSTASH_CURRENT_SIGNING_KEY"
push_env QSTASH_NEXT_SIGNING_KEY "$QSTASH_NEXT_SIGNING_KEY"
push_env STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"
push_env STRIPE_WEBHOOK_SECRET "$STRIPE_WEBHOOK_SECRET"
push_env STRIPE_PRICE_ID "$STRIPE_PRICE_ID"
push_env NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
push_env EBAY_APP_ID "$EBAY_APP_ID"
push_env EBAY_CERT_ID "$EBAY_CERT_ID"
push_env EBAY_DEV_ID "$EBAY_DEV_ID"
push_env EBAY_REDIRECT_URI "$EBAY_REDIRECT_URI"
push_env EBAY_DELETION_VERIFICATION_TOKEN "$EBAY_DELETION_VERIFICATION_TOKEN"
push_env EBAY_VERIFICATION_TOKEN "$EBAY_VERIFICATION_TOKEN"
push_env ETSY_API_KEY "$ETSY_API_KEY"
push_env ETSY_SHARED_SECRET "$ETSY_SHARED_SECRET"
push_env ETSY_REDIRECT_URI "https://soldsync.vercel.app/api/oauth/etsy/callback"
push_env CRON_SECRET "$CRON_SECRET"
push_env NEXT_PUBLIC_APP_URL "https://soldsync.vercel.app"
# Note: EBAY_SANDBOX is intentionally NOT set in production (defaults to false)

echo ""
echo "✅ All env vars pushed. Run: vercel --prod"
