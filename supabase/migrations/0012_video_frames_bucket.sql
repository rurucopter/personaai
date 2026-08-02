-- Private bucket for reference frames extracted from a user's own source
-- video, used to anchor identity more strongly during AI generation.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('video-frames', 'video-frames', false, 5242880, array['image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "video frames: read own" on storage.objects
  for select using (bucket_id = 'video-frames' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "video frames: insert own" on storage.objects
  for insert with check (bucket_id = 'video-frames' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "video frames: delete own" on storage.objects
  for delete using (bucket_id = 'video-frames' and (storage.foldername(name))[1] = auth.uid()::text);
