-- Optimistic concurrency for admin content editors.
create table public.content_section_revisions (
  section text primary key check (
    section in ('site', 'stats', 'events', 'startups', 'listings', 'divisions', 'faculty', 'team', 'posts', 'grants')
  ),
  revision bigint not null default 0 check (revision >= 0)
);

insert into public.content_section_revisions (section)
values ('site'), ('stats'), ('events'), ('startups'), ('listings'), ('divisions'), ('faculty'), ('team'), ('posts'), ('grants');

alter table public.content_section_revisions enable row level security;
grant select on public.content_section_revisions to service_role;

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
  if p_section not in ('site', 'stats', 'events', 'startups', 'listings', 'divisions', 'faculty', 'team', 'posts', 'grants') then
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

-- Submission limits are stored as fixed-window counters and updated atomically.
create table public.form_rate_limits (
  key text primary key check (key ~ '^[a-f0-9]{64}$'),
  bucket_start timestamptz not null,
  hits integer not null check (hits > 0)
);

alter table public.form_rate_limits enable row level security;

create or replace function public.consume_form_rate_limit(
  p_key text,
  p_window_seconds integer,
  p_max_requests integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_hits integer;
begin
  if p_key !~ '^[a-f0-9]{64}$' or p_window_seconds < 1 or p_window_seconds > 3600
    or p_max_requests < 1 or p_max_requests > 100 then
    raise exception 'Invalid rate-limit parameters';
  end if;

  insert into public.form_rate_limits (key, bucket_start, hits)
  values (p_key, v_now, 1)
  on conflict (key) do update set
    bucket_start = case
      when public.form_rate_limits.bucket_start <= v_now - pg_catalog.make_interval(secs => p_window_seconds)
        then v_now
      else public.form_rate_limits.bucket_start
    end,
    hits = case
      when public.form_rate_limits.bucket_start <= v_now - pg_catalog.make_interval(secs => p_window_seconds)
        then 1
      else public.form_rate_limits.hits + 1
    end
  returning hits into v_hits;

  if pg_catalog.random() < 0.01 then
    delete from public.form_rate_limits
    where bucket_start < v_now - interval '1 day';
  end if;

  return v_hits <= p_max_requests;
end;
$$;

revoke all on function public.consume_form_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_form_rate_limit(text, integer, integer) to service_role;

-- Publish the startup and update the source idea within one transaction.
create or replace function public.approve_idea(
  p_id text,
  p_reviewer text,
  p_uid text,
  p_base_slug text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_idea public.ideas%rowtype;
  v_slug text;
  v_suffix integer := 2;
  v_position integer;
begin
  select * into v_idea
  from public.ideas
  where id = p_id
  for update;

  if not found then
    raise exception 'That idea no longer exists';
  end if;

  if v_idea.status = 'Approved' and v_idea.startup_slug is not null then
    return v_idea.startup_slug;
  end if;

  if p_uid is null or p_uid = '' or p_base_slug is null or p_base_slug = '' then
    raise exception 'Invalid startup details';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_base_slug));
  v_slug := p_base_slug;
  while exists (select 1 from public.startups where slug = v_slug) loop
    v_slug := p_base_slug || '-' || v_suffix;
    v_suffix := v_suffix + 1;
  end loop;

  select coalesce(max(position), -1) + 1 into v_position from public.startups;

  insert into public.startups (
    uid, slug, reg_id, name, pitch, category, status, stage, founder,
    problem, solution, source_idea_uid, position
  ) values (
    p_uid, v_slug, '', v_idea.name, v_idea.pitch, v_idea.category, 'Idea', 'Approved idea',
    coalesce(
      nullif(btrim(split_part(split_part(v_idea.team, E'\n', 1), ',', 1)), ''),
      'Student founder'
    ),
    v_idea.problem, v_idea.solution, v_idea.id, v_position
  );

  update public.ideas
  set status = 'Approved',
      startup_slug = v_slug,
      reviewed_by = p_reviewer,
      reviewed_at = pg_catalog.clock_timestamp()
  where id = p_id;

  update public.content_section_revisions
  set revision = revision + 1
  where section = 'startups';

  return v_slug;
end;
$$;

revoke all on function public.approve_idea(text, text, text, text) from public, anon, authenticated;
grant execute on function public.approve_idea(text, text, text, text) to service_role;
