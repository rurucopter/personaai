-- Generated character images were stored as raw fal.ai CDN URLs, which expire
-- after a while and leave dead images. We now re-host them in the
-- character-content bucket (like we already do for result videos), so the
-- bucket must be public-read — same trust level as the provider CDN URLs we
-- were linking to directly, and consistent with the public result-videos bucket.
update storage.buckets
set public = true
where id = 'character-content';
