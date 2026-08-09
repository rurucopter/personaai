-- Idempotency ledger for Stripe webhooks. Stripe delivers each event
-- at-least-once (retries on any non-2xx, network hiccup, or timeout), so the
-- webhook handler claims an event id here before processing; a duplicate
-- delivery hits the primary-key conflict and is skipped, preventing
-- double credit grants / double payment rows.
create table if not exists public.processed_stripe_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

-- Only the service-role client (which bypasses RLS) ever touches this table,
-- but enable RLS with no policies so it's not reachable by anon/authenticated.
alter table public.processed_stripe_events enable row level security;
