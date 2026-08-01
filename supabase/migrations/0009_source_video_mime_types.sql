-- Kling O1 Edit (the active generation model) only accepts .mp4/.mov.
-- The bucket's 200MB size limit was already correct; just drop webm.
update storage.buckets
set allowed_mime_types = array['video/mp4', 'video/quicktime']
where id = 'source-videos';
