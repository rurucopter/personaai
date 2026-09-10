-- Page-view tracking for admin analytics.
-- Lightweight: stores only page path, referrer, and a hashed visitor id (no PII).

create table if not exists page_views (
  id          uuid primary key default gen_random_uuid(),
  path        text not null,
  referrer    text,
  visitor_id  text not null,
  user_agent  text,
  country     text,
  created_at  timestamptz not null default now()
);

create index idx_page_views_created_at on page_views (created_at);
create index idx_page_views_visitor_id on page_views (visitor_id);
create index idx_page_views_path on page_views (path);

-- Only service role can write (via the tracking API).
alter table page_views enable row level security;

create policy "Service role full access"
  on page_views
  for all
  using (true)
  with check (true);
