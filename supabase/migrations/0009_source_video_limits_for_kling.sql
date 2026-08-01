-- Switched the active generation model from Runway Aleph (16MB/5s) to
-- Kling O1 Edit via fal.ai (200MB, .mp4/.mov only, 3-10s). Match the bucket.
update storage.buckets
set file_size_limit = 209715200,
    allowed_mime_types = array['video/mp4', 'video/quicktime']
where id = 'source-videos';
