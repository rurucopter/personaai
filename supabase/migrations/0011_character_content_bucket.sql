insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('character-content', 'character-content', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "character content: read own" on storage.objects
  for select using (bucket_id = 'character-content' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "character content: insert own" on storage.objects
  for insert with check (bucket_id = 'character-content' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "character content: delete own" on storage.objects
  for delete using (bucket_id = 'character-content' and (storage.foldername(name))[1] = auth.uid()::text);
