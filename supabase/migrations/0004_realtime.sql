-- Broadcast row changes on videos so the client can show live generation
-- progress without polling.
alter publication supabase_realtime add table public.videos;
