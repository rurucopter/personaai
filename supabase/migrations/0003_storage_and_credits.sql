-- Storage buckets for source uploads and generated results, plus an
-- atomic credit-spend function to avoid race conditions on the balance.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('source-videos', 'source-videos', false, 209715200, array['video/mp4', 'video/quicktime', 'video/webm']),
  ('result-videos', 'result-videos', false, 209715200, array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do nothing;

-- Users can only read/write objects under a path prefixed with their own uid,
-- e.g. source-videos/{user_id}/{filename}
create policy "source videos: read own" on storage.objects
  for select using (bucket_id = 'source-videos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "source videos: insert own" on storage.objects
  for insert with check (bucket_id = 'source-videos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "source videos: delete own" on storage.objects
  for delete using (bucket_id = 'source-videos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "result videos: read own" on storage.objects
  for select using (bucket_id = 'result-videos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "result videos: delete own" on storage.objects
  for delete using (bucket_id = 'result-videos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------
-- Atomic credit spend: locks the row, checks balance, debits, and logs
-- the ledger entry in a single transaction. Called via supabase.rpc()
-- with the service-role client from the generation API route.
-- ---------------------------------------------------------------------
create or replace function public.spend_credits(
  p_user_id uuid,
  p_amount integer,
  p_video_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_balance integer;
begin
  select balance into current_balance
  from public.credits
  where user_id = p_user_id
  for update;

  if current_balance is null or current_balance < p_amount then
    return false;
  end if;

  update public.credits
  set balance = balance - p_amount, updated_at = now()
  where user_id = p_user_id;

  insert into public.credit_transactions (user_id, amount, type, related_video_id)
  values (p_user_id, -p_amount, 'generation_spend', p_video_id);

  return true;
end;
$$;

create or replace function public.refund_credits(
  p_user_id uuid,
  p_amount integer,
  p_video_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.credits
  set balance = balance + p_amount, updated_at = now()
  where user_id = p_user_id;

  insert into public.credit_transactions (user_id, amount, type, related_video_id)
  values (p_user_id, p_amount, 'refund', p_video_id);
end;
$$;
