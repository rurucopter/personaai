-- Admin flag. No user gets this by default — grant it manually per user:
--   update public.users set is_admin = true where email = 'you@example.com';
alter table public.users add column if not exists is_admin boolean not null default false;
