-- Fictional AI lifestyle characters: a fixed reference face + generated
-- content that reuses it for visual consistency across posts.
create table if not exists public.ai_characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  description text not null,
  reference_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_characters_user_id_idx on public.ai_characters (user_id);

create table if not exists public.character_images (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.ai_characters (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  prompt text not null,
  is_reference boolean not null default false,
  status video_generation_status not null default 'queued',
  provider text not null,
  provider_job_id text,
  image_url text,
  error_message text,
  credits_spent integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists character_images_character_id_idx on public.character_images (character_id);
create index if not exists character_images_user_id_idx on public.character_images (user_id);

alter table public.ai_characters enable row level security;
alter table public.character_images enable row level security;

create policy "ai_characters all own" on public.ai_characters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "character_images all own" on public.character_images
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter publication supabase_realtime add table public.character_images;
