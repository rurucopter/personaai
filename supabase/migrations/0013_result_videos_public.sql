-- Result videos are now re-hosted after film-grain post-processing, so the
-- bucket must be public (same trust level as the provider CDN URLs we used
-- to link to directly).
update storage.buckets
set public = true
where id = 'result-videos';
