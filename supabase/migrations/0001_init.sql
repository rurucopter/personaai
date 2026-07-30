-- PersonaAI initial schema
-- Run manually in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Users (mirrors auth.users; one row per authenticated user)
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Subscriptions (one active subscription per user, Stripe-backed)
-- ---------------------------------------------------------------------
create type subscription_plan as enum ('starter', 'pro', 'business', 'enterprise');
create type subscription_status as enum ('active', 'trialing', 'past_due', 'canceled', 'incomplete');

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  plan subscription_plan not null,
  status subscription_status not null,
  stripe_customer_id text not null,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

-- ---------------------------------------------------------------------
-- Payments (Stripe invoice/charge log)
-- ---------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  stripe_invoice_id text unique,
  amount_cents integer not null,
  currency text not null default 'eur',
  status text not null,
  created_at timestamptz not null default now()
);

create index if not exists payments_user_id_idx on public.payments (user_id);

-- ---------------------------------------------------------------------
-- Credits (running balance) + credit_transactions (ledger)
-- ---------------------------------------------------------------------
create table if not exists public.credits (
  user_id uuid primary key references public.users (id) on delete cascade,
  balance integer not null default 0,
  updated_at timestamptz not null default now()
);

create type credit_transaction_type as enum ('purchase', 'subscription_grant', 'generation_spend', 'refund', 'admin_adjustment');

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  amount integer not null, -- positive = credit, negative = debit
  type credit_transaction_type not null,
  related_video_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists credit_transactions_user_id_idx on public.credit_transactions (user_id);

-- ---------------------------------------------------------------------
-- Projects (a named grouping of transformations, optional organizing unit)
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);

-- ---------------------------------------------------------------------
-- Videos (source upload + generated transformation + job tracking)
-- ---------------------------------------------------------------------
create type video_generation_status as enum ('queued', 'processing', 'completed', 'failed', 'cancelled');

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,

  source_video_url text not null,
  source_duration_seconds numeric,

  persona text not null,
  settings jsonb not null default '{}'::jsonb,

  provider text not null,
  provider_job_id text,

  status video_generation_status not null default 'queued',
  progress integer not null default 0,
  error_message text,

  result_video_url text,
  thumbnail_url text,

  credits_spent integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists videos_user_id_idx on public.videos (user_id);
create index if not exists videos_status_idx on public.videos (status);
create index if not exists videos_project_id_idx on public.videos (project_id);

-- ---------------------------------------------------------------------
-- Favorites
-- ---------------------------------------------------------------------
create table if not exists public.favorites (
  user_id uuid not null references public.users (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

-- ---------------------------------------------------------------------
-- History (append-only audit log of user-facing actions)
-- ---------------------------------------------------------------------
create type history_action as enum ('upload', 'generate', 'download', 'delete', 'duplicate', 'favorite', 'unfavorite');

create table if not exists public.history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  video_id uuid references public.videos (id) on delete set null,
  action history_action not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists history_user_id_idx on public.history (user_id);

-- ---------------------------------------------------------------------
-- Row Level Security: every table is scoped to auth.uid()
-- ---------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.credits enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.projects enable row level security;
alter table public.videos enable row level security;
alter table public.favorites enable row level security;
alter table public.history enable row level security;

create policy "users select own row" on public.users for select using (auth.uid() = id);
create policy "users update own row" on public.users for update using (auth.uid() = id);

create policy "subscriptions select own" on public.subscriptions for select using (auth.uid() = user_id);
create policy "payments select own" on public.payments for select using (auth.uid() = user_id);
create policy "credits select own" on public.credits for select using (auth.uid() = user_id);
create policy "credit_transactions select own" on public.credit_transactions for select using (auth.uid() = user_id);

create policy "projects all own" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "videos all own" on public.videos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "favorites all own" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "history select own" on public.history for select using (auth.uid() = user_id);

-- Note: writes to subscriptions/payments/credits/credit_transactions/history
-- happen exclusively via the service-role key from API routes (Stripe
-- webhooks, generation pipeline) — never directly from the client.
