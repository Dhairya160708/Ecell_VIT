-- Startup pitch video link, and public feedback on startups.
-- Feedback is written by server code (service role) after validation and shows instantly;
-- faculty can hide or delete it from /admin/feedback. No public policies: the anon key cannot touch it.

alter table public.startups add column video_url text;

create table public.startup_feedback (
  id text primary key,
  startup_slug text not null references public.startups (slug) on update cascade on delete cascade,
  name text not null default '' check (char_length(name) <= 60),
  body text not null check (char_length(body) between 3 and 500),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.startup_feedback (startup_slug, created_at desc);
alter table public.startup_feedback enable row level security;
