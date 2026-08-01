-- Public bucket for AI-generated persona style reference images
-- (app-managed content, written only via the service-role key).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('persona-references', 'persona-references', true, 5242880, array['image/webp', 'image/png', 'image/jpeg'])
on conflict (id) do nothing;

create policy "persona references: public read" on storage.objects
  for select using (bucket_id = 'persona-references');
