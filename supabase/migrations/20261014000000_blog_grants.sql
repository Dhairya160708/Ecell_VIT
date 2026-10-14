-- Blog posts (written and published only by faculty from /admin) and government grants listings.
-- Same access model as the other content tables: public read, writes via the service role after a faculty check.

create table public.blog_posts (
  uid text primary key,
  slug text not null unique,
  title text not null,
  summary text not null default '',
  body text not null default '',
  author text not null default '',
  date date not null default current_date,
  cover text,
  position int not null default 0
);

create table public.grants (
  uid text primary key,
  name text not null,
  agency text not null default '',
  amount text not null default '',
  deadline text not null default '',
  eligibility text not null default '',
  summary text not null default '',
  url text,
  position int not null default 0
);

alter table public.blog_posts enable row level security;
alter table public.grants enable row level security;
create policy "public read" on public.blog_posts for select using (true);
create policy "public read" on public.grants for select using (true);
