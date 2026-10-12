-- E-Cell VIT: content, submissions and faculty accounts.
-- All writes go through server code using the service-role key after a faculty check; RLS is on everywhere,
-- and the anon key can only READ the public content tables.

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb
);

create table public.stats (
  uid text primary key,
  value text not null,
  label text not null,
  position int not null default 0
);

create table public.divisions (
  uid text primary key,
  name text not null,
  line text not null default '',
  position int not null default 0
);

create table public.events (
  uid text primary key,
  title text not null,
  date date not null,
  end_date date,
  category text not null default '',
  summary text not null default '',
  report text,
  report_url text,
  position int not null default 0,
  -- status (Upcoming / Ongoing / Past) is deliberately NOT stored: it is derived from date/end_date.
  check (end_date is null or end_date >= date)
);

create table public.startups (
  uid text primary key,
  slug text not null unique,
  reg_id text not null default '',
  name text not null,
  pitch text not null default '',
  category text not null default '',
  status text not null default 'Idea' check (status in ('Idea', 'Building', 'Launched')),
  stage text not null default '',
  founder text not null default '',
  problem text not null default '',
  solution text not null default '',
  photo text,
  website text,
  source_idea_uid text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.listings (
  uid text primary key,
  startup_slug text not null references public.startups (slug) on update cascade on delete cascade,
  role text not null,
  skills text[] not null default '{}',
  commitment text not null default '',
  compensation text not null default 'Unpaid' check (compensation in ('Paid', 'Equity', 'Unpaid')),
  position int not null default 0
);

-- Faculty advisors shown on the public site (not the same as faculty who can log in).
create table public.faculty_members (
  uid text primary key,
  name text not null,
  role text not null default '',
  dept text,
  photo text,
  position int not null default 0
);

create table public.team_members (
  uid text primary key,
  name text not null,
  role text not null default '',
  domain text,
  linkedin text,
  github text,
  photo text,
  position int not null default 0
);

-- Faculty/admin accounts: a Supabase Auth user is only an admin if it has a row here.
create table public.faculty_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null default '',
  created_at timestamptz not null default now()
);

create table public.messages (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  role text not null default '',
  body text not null,
  status text not null default 'New' check (status in ('New', 'Read', 'Done')),
  note text
);

-- Idea pipeline: New (submitted) -> Reviewing -> Approved (published as a startup) | Rejected
create table public.ideas (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  pitch text not null,
  category text not null default '',
  problem text not null,
  solution text not null,
  team text not null default '',
  email text not null,
  status text not null default 'New' check (status in ('New', 'Reviewing', 'Approved', 'Rejected')),
  score int check (score between 0 and 10),
  comments text,
  startup_slug text,
  reviewed_by text,
  reviewed_at timestamptz
);

create table public.applications (
  id text primary key,
  created_at timestamptz not null default now(),
  listing_uid text references public.listings (uid) on delete set null,
  role text not null,
  startup text not null,
  name text not null,
  email text not null,
  pitch text not null,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Closed'))
);

create index on public.events (date);
create index on public.ideas (status, created_at desc);
create index on public.applications (created_at desc);
create index on public.messages (created_at desc);

-- Row level security: on for everything; only public content is readable with the anon key.
alter table public.site_settings enable row level security;
alter table public.stats enable row level security;
alter table public.divisions enable row level security;
alter table public.events enable row level security;
alter table public.startups enable row level security;
alter table public.listings enable row level security;
alter table public.faculty_members enable row level security;
alter table public.team_members enable row level security;
alter table public.faculty_users enable row level security;
alter table public.messages enable row level security;
alter table public.ideas enable row level security;
alter table public.applications enable row level security;

create policy "public read" on public.site_settings for select using (true);
create policy "public read" on public.stats for select using (true);
create policy "public read" on public.divisions for select using (true);
create policy "public read" on public.events for select using (true);
create policy "public read" on public.startups for select using (true);
create policy "public read" on public.listings for select using (true);
create policy "public read" on public.faculty_members for select using (true);
create policy "public read" on public.team_members for select using (true);
-- faculty_users, messages, ideas, applications: no policies = no access except the service role.
