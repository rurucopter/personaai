-- No more free trial credits at signup — a fresh account starts at 0 and
-- must subscribe to generate anything. Referral rewards (3 credits when a
-- referred friend subscribes) are untouched — that's a real conversion
-- event, not a free grant on account creation.

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
  values (new.id, 0);

  return new;
end;
$$;
