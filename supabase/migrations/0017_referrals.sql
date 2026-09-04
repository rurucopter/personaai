-- Referral program: every user gets a shareable code; referred_by tracks
-- who brought them in. The reward is granted from the Stripe webhook when
-- the referred user's FIRST paid subscription activates (not at signup —
-- a free signup costs nothing to reward but converts nothing either), so
-- referral_reward_granted guards against paying it out twice on renewals.

alter table public.users add column if not exists referral_code text;
alter table public.users add column if not exists referred_by uuid references public.users(id);
alter table public.users add column if not exists referral_reward_granted boolean not null default false;

update public.users set referral_code = substr(md5(random()::text || id::text), 1, 8)
where referral_code is null;

alter table public.users alter column referral_code set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_referral_code_key'
  ) then
    alter table public.users add constraint users_referral_code_key unique (referral_code);
  end if;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer_id uuid;
begin
  if new.raw_user_meta_data ->> 'referred_by_code' is not null then
    select id into v_referrer_id
    from public.users
    where referral_code = new.raw_user_meta_data ->> 'referred_by_code';
  end if;

  insert into public.users (id, email, full_name, avatar_url, referral_code, referred_by)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    substr(md5(random()::text || new.id::text), 1, 8),
    v_referrer_id
  );

  insert into public.credits (user_id, balance)
  values (new.id, 3); -- free trial credits

  insert into public.credit_transactions (user_id, amount, type)
  values (new.id, 3, 'subscription_grant');

  return new;
end;
$$;
