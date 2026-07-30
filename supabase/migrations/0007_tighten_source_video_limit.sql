-- Runway Gen-4 Aleph (the active generation model) hard-requires source
-- videos under 16MB. Tighten the bucket limit to match (was 200MB).
update storage.buckets
set file_size_limit = 16777216
where id = 'source-videos';
