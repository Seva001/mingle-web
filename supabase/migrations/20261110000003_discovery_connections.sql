-- Mingle Batch D: private discovery projection, member actions and reciprocal connections.
-- Apply after Batch C. No raw profile tables are made readable across members.

create table public.member_likes (
  actor_id uuid not null references public.accounts(id) on delete cascade,
  target_id uuid not null references public.accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (actor_id, target_id),
  check (actor_id <> target_id)
);
create index member_likes_target_idx on public.member_likes(target_id, created_at desc);

create table public.member_passes (
  actor_id uuid not null references public.accounts(id) on delete cascade,
  target_id uuid not null references public.accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (actor_id, target_id),
  check (actor_id <> target_id)
);

create table public.saved_profiles (
  account_id uuid not null references public.accounts(id) on delete cascade,
  saved_account_id uuid not null references public.accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (account_id, saved_account_id),
  check (account_id <> saved_account_id)
);

create table public.member_blocks (
  actor_id uuid not null references public.accounts(id) on delete cascade,
  target_id uuid not null references public.accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (actor_id, target_id),
  check (actor_id <> target_id)
);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  member_one uuid not null references public.accounts(id) on delete cascade,
  member_two uuid not null references public.accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint connections_distinct_members check (member_one < member_two),
  constraint connections_pair_unique unique (member_one, member_two)
);
create index connections_member_one_idx on public.connections(member_one, created_at desc);
create index connections_member_two_idx on public.connections(member_two, created_at desc);

alter table public.member_likes enable row level security;
alter table public.member_passes enable row level security;
alter table public.saved_profiles enable row level security;
alter table public.member_blocks enable row level security;
alter table public.connections enable row level security;
revoke all on public.member_likes, public.member_passes, public.saved_profiles,
  public.member_blocks, public.connections from anon, authenticated;

-- A member can inspect only their own action rows. Writes go through RPCs so callers
-- cannot spoof actor_id or create a connection directly.
grant select on public.member_likes, public.member_passes, public.saved_profiles,
  public.member_blocks, public.connections to authenticated;
create policy likes_read_own on public.member_likes for select to authenticated
  using (actor_id = (select auth.uid()) and (select public.is_active_member()));
create policy passes_read_own on public.member_passes for select to authenticated
  using (actor_id = (select auth.uid()) and (select public.is_active_member()));
create policy saved_read_own on public.saved_profiles for select to authenticated
  using (account_id = (select auth.uid()) and (select public.is_active_member()));
create policy blocks_read_own on public.member_blocks for select to authenticated
  using (actor_id = (select auth.uid()) and (select public.is_active_member()));
create policy connections_read_member on public.connections for select to authenticated
  using ((member_one = (select auth.uid()) or member_two = (select auth.uid()))
    and (select public.is_active_member()));

-- Private discovery projection. It deliberately returns only approved photos and selected
-- profile fields. It never grants SELECT on another member's profile/DOB/preferences/answers.
create function public.get_discovery_candidates(result_limit integer default 24, result_offset integer default 0)
returns setof jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare member_id uuid := auth.uid();
begin
  if member_id is null or not public.is_active_member() then
    raise exception 'member access unavailable' using errcode = '42501';
  end if;
  if result_limit < 1 or result_limit > 50 or result_offset < 0 or result_offset > 500 then
    raise exception 'invalid discovery page' using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles p where p.account_id = member_id
    and p.profile_status = 'complete' and p.visibility = 'visible') then
    return;
  end if;
  return query
  select jsonb_build_object(
    'id', p.account_id,
    'display_name', p.display_name,
    'gender', p.gender,
    'age', extract(year from age(current_date, bd.date_of_birth))::integer,
    'city', p.city,
    'country', p.country,
    'bio', p.bio,
    'intention', p.relationship_intention,
    'interests', p.interests,
    'shared_interests', coalesce((select jsonb_agg(shared.interest) from (
      select unnest(p.interests) as interest intersect select unnest(mp.interests) as interest
    ) shared), '[]'::jsonb),
    'shared_answers', (select count(*)::integer from public.compatibility_answers mine
      join public.compatibility_answers theirs on theirs.question_id = mine.question_id
        and theirs.option_id = mine.option_id
      where mine.account_id = member_id and theirs.account_id = p.account_id),
    'aligned_intention', (p.relationship_intention is not null and p.relationship_intention = mp.relationship_intention),
    'photos', coalesce((select jsonb_agg(jsonb_build_object('id', ph.id, 'storage_path', ph.storage_path)
      order by ph.position) from public.profile_photos ph
      where ph.account_id = p.account_id and ph.moderation_state = 'approved'), '[]'::jsonb)
  )
  from public.profiles p
  join public.accounts a on a.id = p.account_id and a.status = 'active'
  join public.account_birth_dates bd on bd.account_id = p.account_id
  join public.account_birth_dates my_dob on my_dob.account_id = member_id
  join public.preferences cp on cp.account_id = p.account_id
  join public.profiles mp on mp.account_id = member_id
  join public.preferences mpref on mpref.account_id = member_id
  where p.account_id <> member_id
    and p.profile_status = 'complete' and p.visibility = 'visible'
    and extract(year from age(current_date, bd.date_of_birth)) between mpref.age_min and mpref.age_max
    and extract(year from age(current_date, my_dob.date_of_birth)) between cp.age_min and cp.age_max
    and extract(year from age(current_date, bd.date_of_birth)) between 18 and 120
    and p.gender = any(mpref.interested_in)
    and mp.gender = any(cp.interested_in)
    and public.is_active_member()
    and exists (select 1 from public.profile_photos approved
      where approved.account_id = p.account_id and approved.moderation_state = 'approved')
    and not exists (select 1 from public.member_passes x where x.actor_id = member_id and x.target_id = p.account_id)
    and not exists (select 1 from public.member_likes x where x.actor_id = member_id and x.target_id = p.account_id)
    and not exists (select 1 from public.member_blocks x
      where (x.actor_id = member_id and x.target_id = p.account_id)
         or (x.actor_id = p.account_id and x.target_id = member_id))
    and not exists (select 1 from public.connections x
      where (x.member_one = least(member_id, p.account_id) and x.member_two = greatest(member_id, p.account_id)))
  order by p.updated_at desc, p.account_id
  limit result_limit offset result_offset;
end;
$$;
revoke all on function public.get_discovery_candidates(integer, integer) from public, anon;
grant execute on function public.get_discovery_candidates(integer, integer) to authenticated;

-- A like is idempotent. A connection is created atomically only if the other member
-- has already liked the caller and both accounts still meet current discovery gates.
create function public.like_member(target_account_id uuid)
returns table (liked boolean, matched boolean, connection_id uuid)
language plpgsql security definer set search_path = ''
as $$
declare member_id uuid := auth.uid(); pair_one uuid; pair_two uuid; new_connection uuid;
begin
  if member_id is null or not public.is_active_member() or target_account_id = member_id then
    raise exception 'member action unavailable' using errcode = '42501';
  end if;
  pair_one := least(member_id, target_account_id);
  pair_two := greatest(member_id, target_account_id);
  perform pg_advisory_xact_lock(hashtextextended(pair_one::text || ':' || pair_two::text, 0));
  if not exists (
    select 1 from public.profiles me
    join public.preferences mine on mine.account_id = me.account_id
    join public.profiles them on them.account_id = target_account_id
    join public.preferences theirs on theirs.account_id = them.account_id
    join public.accounts ta on ta.id = them.account_id and ta.status = 'active'
    join public.account_birth_dates dob on dob.account_id = them.account_id
    join public.account_birth_dates my_dob on my_dob.account_id = member_id
    where me.account_id = member_id and me.profile_status = 'complete' and me.visibility = 'visible'
      and them.profile_status = 'complete' and them.visibility = 'visible'
      and them.gender = any(mine.interested_in) and me.gender = any(theirs.interested_in)
      and extract(year from age(current_date, dob.date_of_birth)) between mine.age_min and mine.age_max
      and extract(year from age(current_date, my_dob.date_of_birth)) between theirs.age_min and theirs.age_max
      and exists (select 1 from public.profile_photos ph where ph.account_id = them.account_id and ph.moderation_state = 'approved')
      and not exists (select 1 from public.member_passes passed where
        (passed.actor_id = member_id and passed.target_id = target_account_id) or
        (passed.actor_id = target_account_id and passed.target_id = member_id))
      and not exists (select 1 from public.member_blocks b where
        (b.actor_id = member_id and b.target_id = target_account_id) or
        (b.actor_id = target_account_id and b.target_id = member_id))
  ) then raise exception 'profile is no longer eligible' using errcode = '22023'; end if;

  insert into public.member_likes(actor_id, target_id) values(member_id, target_account_id)
    on conflict (actor_id, target_id) do nothing;
  if exists (select 1 from public.member_likes where actor_id = target_account_id and target_id = member_id) then
    insert into public.connections(member_one, member_two) values(pair_one, pair_two)
      on conflict (member_one, member_two) do nothing;
    select id into new_connection from public.connections where member_one = pair_one and member_two = pair_two;
    return query select true, true, new_connection;
  else
    return query select true, false, null::uuid;
  end if;
end;
$$;
revoke all on function public.like_member(uuid) from public, anon;
grant execute on function public.like_member(uuid) to authenticated;

create function public.pass_member(target_account_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare member_id uuid := auth.uid();
begin
  if member_id is null or not public.is_active_member() or target_account_id = member_id then
    raise exception 'member action unavailable' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(least(member_id, target_account_id)::text || ':' || greatest(member_id, target_account_id)::text, 0));
  insert into public.member_passes(actor_id, target_id) values(member_id, target_account_id)
    on conflict (actor_id, target_id) do nothing;
  delete from public.saved_profiles where account_id = member_id and saved_account_id = target_account_id;
end;
$$;
revoke all on function public.pass_member(uuid) from public, anon;
grant execute on function public.pass_member(uuid) to authenticated;

create function public.toggle_saved_profile(target_account_id uuid, should_save boolean) returns void
language plpgsql security definer set search_path = ''
as $$
declare member_id uuid := auth.uid();
begin
  if member_id is null or not public.is_active_member() or target_account_id = member_id then
    raise exception 'member action unavailable' using errcode = '42501';
  end if;
  if should_save then
    if not exists (select 1 from public.profiles p join public.accounts a on a.id = p.account_id
      where p.account_id = target_account_id and p.visibility = 'visible'
        and p.profile_status = 'complete' and a.status = 'active') then
      raise exception 'profile is unavailable' using errcode = '22023';
    end if;
    insert into public.saved_profiles(account_id, saved_account_id) values(member_id, target_account_id)
      on conflict (account_id, saved_account_id) do nothing;
  else
    delete from public.saved_profiles where account_id = member_id and saved_account_id = target_account_id;
  end if;
end;
$$;
revoke all on function public.toggle_saved_profile(uuid, boolean) from public, anon;
grant execute on function public.toggle_saved_profile(uuid, boolean) to authenticated;

create function public.block_member(target_account_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare member_id uuid := auth.uid(); pair_one uuid; pair_two uuid;
begin
  if member_id is null or not public.is_active_member() or target_account_id = member_id then
    raise exception 'member action unavailable' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(least(member_id, target_account_id)::text || ':' || greatest(member_id, target_account_id)::text, 0));
  insert into public.member_blocks(actor_id, target_id) values(member_id, target_account_id)
    on conflict (actor_id, target_id) do nothing;
  delete from public.saved_profiles where account_id = member_id and saved_account_id = target_account_id;
  delete from public.member_likes where (actor_id = member_id and target_id = target_account_id)
    or (actor_id = target_account_id and target_id = member_id);
  pair_one := least(member_id, target_account_id); pair_two := greatest(member_id, target_account_id);
  delete from public.connections where member_one = pair_one and member_two = pair_two;
end;
$$;
revoke all on function public.block_member(uuid) from public, anon;
grant execute on function public.block_member(uuid) to authenticated;

create function public.get_my_connections()
returns setof jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare member_id uuid := auth.uid();
begin
  if member_id is null or not public.is_active_member() then
    raise exception 'member access unavailable' using errcode = '42501';
  end if;
  return query
  select jsonb_build_object('connection_id', c.id, 'connected_at', c.created_at,
    'id', p.account_id, 'display_name', p.display_name,
    'age', extract(year from age(current_date, bd.date_of_birth))::integer,
    'city', p.city, 'country', p.country, 'bio', p.bio)
  from public.connections c
  join public.profiles p on p.account_id = case when c.member_one = member_id then c.member_two else c.member_one end
  join public.accounts a on a.id = p.account_id and a.status = 'active'
  join public.account_birth_dates bd on bd.account_id = p.account_id
  where (c.member_one = member_id or c.member_two = member_id)
    and not exists (select 1 from public.member_blocks b where
      (b.actor_id = member_id and b.target_id = p.account_id) or
      (b.actor_id = p.account_id and b.target_id = member_id))
  order by c.created_at desc;
end;
$$;
revoke all on function public.get_my_connections() from public, anon;
grant execute on function public.get_my_connections() to authenticated;

create function public.get_my_saved_profiles()
returns setof jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare member_id uuid := auth.uid();
begin
  if member_id is null or not public.is_active_member() then
    raise exception 'member access unavailable' using errcode = '42501';
  end if;
  return query
  select jsonb_build_object('id', p.account_id, 'display_name', p.display_name,
    'age', extract(year from age(current_date, bd.date_of_birth))::integer,
    'city', p.city, 'country', p.country, 'bio', p.bio)
  from public.saved_profiles s
  join public.profiles p on p.account_id = s.saved_account_id
  join public.accounts a on a.id = p.account_id and a.status = 'active'
  join public.account_birth_dates bd on bd.account_id = p.account_id
  where s.account_id = member_id and p.visibility = 'visible' and p.profile_status = 'complete'
    and not exists (select 1 from public.member_blocks b where
      (b.actor_id = member_id and b.target_id = p.account_id) or
      (b.actor_id = p.account_id and b.target_id = member_id))
  order by s.created_at desc;
end;
$$;
revoke all on function public.get_my_saved_profiles() from public, anon;
grant execute on function public.get_my_saved_profiles() to authenticated;
