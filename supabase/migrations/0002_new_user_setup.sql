-- Auto-provision public.users + starter credits when someone signs up
-- via Supabase Auth (email, Google, or Apple).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.credits (user_id, balance)
  values (new.id, 3); -- free trial credits

  insert into public.credit_transactions (user_id, amount, type)
  values (new.id, 3, 'subscription_grant');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
