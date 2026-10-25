-- Gallery photos, student blog submissions with moderation, and external internship applications.

-- ---------- gallery ----------
create table public.gallery_photos (
  uid text primary key,
  src text not null,
  alt text not null default '',
  caption text,
  width int check (width is null or width > 0),
  height int check (height is null or height > 0),
  position int not null default 0
);

create index on public.gallery_photos (position);
alter table public.gallery_photos enable row level security;
-- Photos are uploaded and curated by faculty, so everything in this table is approved for public display.
create policy "public read" on public.gallery_photos for select using (true);

-- Allow the generic editor to save the new gallery section.
alter table public.content_section_revisions drop constraint content_section_revisions_section_check;
alter table public.content_section_revisions add constraint content_section_revisions_section_check check (
  section in (
    'site', 'stats', 'events', 'startups', 'listings', 'divisions',
    'faculty', 'team', 'posts', 'grants', 'gallery'
  )
);
insert into public.content_section_revisions (section) values ('gallery') on conflict do nothing;

create or replace function public.save_content_section(
  p_section text,
  p_expected_revision bigint,
  p_payload jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_table text;
  v_current_revision bigint;
  v_columns text;
  v_select_columns text;
  v_updates text;
  v_key_count integer;
  v_column_count integer;
begin
  if p_section not in ('site', 'stats', 'events', 'startups', 'listings', 'divisions', 'faculty', 'team', 'posts', 'grants', 'gallery') then
    raise exception 'Unknown content section';
  end if;

  insert into public.content_section_revisions (section)
  values (p_section)
  on conflict (section) do nothing;

  select revision into v_current_revision
  from public.content_section_revisions
  where section = p_section
  for update;

  if v_current_revision <> p_expected_revision then
    return -1;
  end if;

  if p_section = 'site' then
    if pg_catalog.jsonb_typeof(p_payload) <> 'object' then
      raise exception 'Invalid site content payload';
    end if;
    insert into public.site_settings (id, data)
    values (1, p_payload)
    on conflict (id) do update set data = excluded.data;
  else
    if pg_catalog.jsonb_typeof(p_payload) <> 'array' then
      raise exception 'Invalid list content payload';
    end if;

    v_table := case p_section
      when 'stats' then 'stats'
      when 'events' then 'events'
      when 'startups' then 'startups'
      when 'listings' then 'listings'
      when 'divisions' then 'divisions'
      when 'faculty' then 'faculty_members'
      when 'team' then 'team_members'
      when 'posts' then 'blog_posts'
      when 'grants' then 'grants'
      when 'gallery' then 'gallery_photos'
    end;

    if pg_catalog.jsonb_array_length(p_payload) > 0 then
      select
        pg_catalog.string_agg(pg_catalog.format('%I', c.column_name), ', ' order by c.ordinal_position),
        pg_catalog.string_agg(pg_catalog.format('r.%I', c.column_name), ', ' order by c.ordinal_position),
        pg_catalog.string_agg(pg_catalog.format('%I = excluded.%I', c.column_name, c.column_name), ', ' order by c.ordinal_position)
          filter (where c.column_name <> 'uid'),
        (select pg_catalog.count(*) from pg_catalog.jsonb_object_keys(p_payload -> 0))
      into v_columns, v_select_columns, v_updates, v_key_count
      from information_schema.columns c
      where c.table_schema = 'public'
        and c.table_name = v_table
        and c.column_name in (select pg_catalog.jsonb_object_keys(p_payload -> 0));

      select pg_catalog.count(*) into v_column_count
      from information_schema.columns c
      where c.table_schema = 'public'
        and c.table_name = v_table
        and c.column_name in (select pg_catalog.jsonb_object_keys(p_payload -> 0));

      if v_key_count <> v_column_count or v_columns is null or v_updates is null
        or not (p_payload -> 0 ? 'uid') then
        raise exception 'Invalid content payload for section %', p_section;
      end if;

      execute pg_catalog.format(
        'insert into public.%I (%s)
         select %s
         from pg_catalog.jsonb_array_elements($1) as j(value)
         cross join lateral pg_catalog.jsonb_populate_record(null::public.%I, j.value) as r
         on conflict (uid) do update set %s',
        v_table, v_columns, v_select_columns, v_table, v_updates
      ) using p_payload;
    end if;

    execute pg_catalog.format(
      'delete from public.%I as existing
       where not exists (
         select 1 from pg_catalog.jsonb_array_elements($1) as j(value)
         where j.value ->> ''uid'' = existing.uid
       )',
      v_table
    ) using p_payload;
  end if;

  update public.content_section_revisions
  set revision = revision + 1
  where section = p_section
  returning revision into v_current_revision;

  return v_current_revision;
end;
$$;

revoke all on function public.save_content_section(text, bigint, jsonb) from public, anon, authenticated;
grant execute on function public.save_content_section(text, bigint, jsonb) to service_role;

-- ---------- marketplace application methods ----------
alter table public.listings
  add column application_method text not null default 'internal'
    check (application_method in ('internal', 'external')),
  add column application_url text;

alter table public.listings
  add constraint listings_external_application_url check (
    application_method = 'internal'
    or (application_url is not null and application_url ~* '^https?://[^\s]+$')
  );

-- ---------- student blog submissions ----------
-- Students write into blog_submissions (service role only). Approval atomically copies the post into
-- blog_posts, the only table the public blog reads. Pending and rejected writing is never public.
create table public.blog_submissions (
  id text primary key,
  created_at timestamptz not null default now(),
  title text not null,
  summary text not null default '',
  body text not null,
  author text not null,
  author_email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  post_slug text,
  reviewed_by text,
  reviewed_at timestamptz
);

create index on public.blog_submissions (status, created_at desc);
alter table public.blog_submissions enable row level security;
-- No public policies: only server code using the service-role key (after a faculty check) can read these.

create or replace function public.approve_blog_submission(
  p_id text,
  p_uid text,
  p_base_slug text,
  p_publish_date date,
  p_reviewer text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_submission public.blog_submissions%rowtype;
  v_slug text;
  v_suffix integer := 2;
  v_position integer;
begin
  select * into v_submission
  from public.blog_submissions
  where id = p_id
  for update;

  if not found then
    raise exception 'That blog submission no longer exists';
  end if;

  if v_submission.status = 'approved' and v_submission.post_slug is not null then
    return v_submission.post_slug;
  end if;

  if p_uid is null or p_uid = '' or p_base_slug is null
    or p_base_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Invalid blog post details';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_base_slug));
  v_slug := p_base_slug;
  while exists (select 1 from public.blog_posts where slug = v_slug) loop
    v_slug := p_base_slug || '-' || v_suffix;
    v_suffix := v_suffix + 1;
  end loop;

  select coalesce(max(position), -1) + 1 into v_position from public.blog_posts;

  insert into public.blog_posts (uid, slug, title, summary, body, author, date, cover, position)
  values (
    p_uid, v_slug, v_submission.title, v_submission.summary, v_submission.body,
    v_submission.author, p_publish_date, null, v_position
  );

  update public.blog_submissions
  set status = 'approved',
      rejection_reason = null,
      post_slug = v_slug,
      reviewed_by = nullif(pg_catalog.btrim(p_reviewer), ''),
      reviewed_at = pg_catalog.clock_timestamp()
  where id = p_id;

  update public.content_section_revisions
  set revision = revision + 1
  where section = 'posts';

  return v_slug;
end;
$$;

revoke all on function public.approve_blog_submission(text, text, text, date, text) from public, anon, authenticated;
grant execute on function public.approve_blog_submission(text, text, text, date, text) to service_role;
