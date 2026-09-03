-- Text-to-video generation has no source video at all — the whole point is
-- generating one from a written story/prompt. source_video_url was
-- previously required (video-to-video editing of an uploaded clip).
alter table public.videos alter column source_video_url drop not null;

-- Store the user's story text so a duplicate/retry can regenerate it without
-- a source video to fall back on.
alter table public.videos add column if not exists story text;
