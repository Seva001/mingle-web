-- Mingle Batch C: private member profiles, preferences, compatibility answers and photos.
-- Apply after 20261110000001_accounts_and_eligibility.sql on a dedicated development project.
-- Cross-member profile projection is intentionally NOT granted here; Batch D owns discovery.

create table public.profiles (
  account_id uuid primary key references public.accounts (id) on delete cascade,
  display_name text check (display_name is null or (char_length(btrim(display_name)) between 2 and 40
    and display_name !~* '(https?://|www\.|@)')),
  gender text check (gender is null or gender in ('woman', 'man', 'non_binary')),
  city text check (city is null or char_length(btrim(city)) between 2 and 60),
  country text check (country is null or char_length(btrim(country)) between 2 and 60),
  bio text check (bio is null or char_length(btrim(bio)) between 20 and 500),
  relationship_intention text
    check (relationship_intention is null or relationship_intention in ('long_term', 'marriage', 'dating_open', 'friendship_first')),
  interests text[] not null default '{}' check (cardinality(interests) = 0 or cardinality(interests) between 3 and 8),
  visibility text not null default 'visible' check (visibility in ('visible', 'hidden')),
  profile_status text not null default 'draft' check (profile_status in ('draft', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  -- Store only a private bucket object path; never a public URL or base64 image.
  storage_path text not null unique,
  position smallint not null check (position between 0 and 5),
  moderation_state text not null default 'pending'
    check (moderation_state in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  constraint profile_photos_account_position_key unique (account_id, position)
    deferrable initially deferred
);
create index profile_photos_account_id_idx on public.profile_photos (account_id);

create table public.preferences (
  account_id uuid primary key references public.accounts (id) on delete cascade,
  interested_in text[] not null check (cardinality(interested_in) >= 1
    and interested_in <@ array['woman', 'man', 'non_binary']),
  age_min smallint not null check (age_min >= 18 and age_min <= 99),
  age_max smallint not null check (age_max >= 18 and age_max <= 99),
  max_distance_km smallint check (max_distance_km is null or max_distance_km in (25, 50, 100, 250)),
  updated_at timestamptz not null default now(),
  check (age_min <= age_max)
);

create table public.compatibility_answers (
  account_id uuid not null references public.accounts (id) on delete cascade,
  question_id text not null check (char_length(question_id) between 1 and 40),
  option_id text not null check (char_length(option_id) between 1 and 40),
  updated_at timestamptz not null default now(),
  primary key (account_id, question_id)
);

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger preferences_set_updated_at before update on public.preferences
  for each row execute function public.set_updated_at();
create trigger compatibility_answers_set_updated_at before update on public.compatibility_answers
  for each row execute function public.set_updated_at();

-- A narrow helper used by RLS. It reveals only whether the current session is active.
create function public.is_active_member() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.accounts a
    where a.id = (select auth.uid()) and a.status = 'active'
  );
$$;
revoke all on function public.is_active_member() from public, anon;
grant execute on function public.is_active_member() to authenticated;

alter table public.profiles enable row level security;
alter table public.profile_photos enable row level security;
alter table public.preferences enable row level security;
alter table public.compatibility_answers enable row level security;

revoke all on public.profiles, public.profile_photos, public.preferences,
  public.compatibility_answers from anon, authenticated;
grant select on public.profiles, public.preferences, public.compatibility_answers to authenticated;
-- Only the visibility switch is directly writable. Profile content and preferences are written
-- through the validated SECURITY DEFINER step RPC; profile_status is never member-writable.
grant update (visibility) on public.profiles to authenticated;
grant delete on public.compatibility_answers to authenticated;
grant select on public.profile_photos to authenticated;

create policy profiles_own on public.profiles for all to authenticated
  using ((select auth.uid()) = account_id and (select public.is_active_member()))
  with check ((select auth.uid()) = account_id and (select public.is_active_member()));
create policy preferences_own on public.preferences for all to authenticated
  using ((select auth.uid()) = account_id and (select public.is_active_member()))
  with check ((select auth.uid()) = account_id and (select public.is_active_member()));
create policy answers_own on public.compatibility_answers for all to authenticated
  using ((select auth.uid()) = account_id and (select public.is_active_member()))
  with check ((select auth.uid()) = account_id and (select public.is_active_member()));
create policy photos_select_own on public.profile_photos for select to authenticated
  using ((select auth.uid()) = account_id and (select public.is_active_member()));

-- Private bucket: server code creates short-lived signed URLs after authenticating the owner.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', false, 10485760, array['image/jpeg']);

create policy profile_photo_objects_select_own on storage.objects for select to authenticated
  using (bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.is_active_member()));

-- Return the signed-in member's display age without granting browser access to DOB.
create function public.get_my_profile_age() returns integer
language sql stable security definer set search_path = ''
as $$
  select extract(year from age(current_date, b.date_of_birth))::integer
  from public.account_birth_dates b
  join public.accounts a on a.id = b.account_id
  where b.account_id = (select auth.uid()) and a.status = 'active';
$$;
revoke all on function public.get_my_profile_age() from public, anon;
grant execute on function public.get_my_profile_age() to authenticated;

-- Atomic profile/preferences/answer save. Account identity always comes from auth.uid().
create function public.save_my_profile_step(section_key text, profile_data jsonb) returns void
language plpgsql security definer set search_path = ''
as $$
declare member_id uuid := auth.uid();
begin
  if member_id is null or not public.is_active_member() then
    raise exception 'member access unavailable' using errcode = '42501';
  end if;
  if section_key = 'basics' then
    insert into public.profiles (account_id, display_name, gender, city, country, bio)
    values (member_id, profile_data->>'display_name', profile_data->>'gender',
      profile_data->>'city', profile_data->>'country', profile_data->>'bio')
    on conflict (account_id) do update set
      display_name = excluded.display_name, gender = excluded.gender,
      city = excluded.city, country = excluded.country, bio = excluded.bio;
  elsif section_key = 'intentions' then
    insert into public.profiles (account_id, relationship_intention, interests)
    values (member_id, profile_data->>'relationship_intention',
      array(select jsonb_array_elements_text(profile_data->'interests')))
    on conflict (account_id) do update set
      relationship_intention = excluded.relationship_intention, interests = excluded.interests;
  elsif section_key = 'preferences' then
    insert into public.preferences (account_id, interested_in, age_min, age_max, max_distance_km)
    values (member_id, array(select jsonb_array_elements_text(profile_data->'interested_in')),
      (profile_data->>'age_min')::smallint, (profile_data->>'age_max')::smallint,
      nullif(profile_data->>'max_distance_km', '')::smallint)
    on conflict (account_id) do update set
      interested_in = excluded.interested_in, age_min = excluded.age_min,
      age_max = excluded.age_max, max_distance_km = excluded.max_distance_km;
  elsif section_key = 'questionnaire' then
    if exists (
      select 1 from jsonb_array_elements(coalesce(profile_data->'answers', '[]'::jsonb)) item
      where not ((item->>'question_id', item->>'option_id') in (
        ('v_family', 'central'), ('v_family', 'very'), ('v_family', 'alongside'), ('v_family', 'not_now'),
        ('v_ambition', 'driven'), ('v_ambition', 'balanced'), ('v_ambition', 'life_first'), ('v_ambition', 'figuring'),
        ('v_priority', 'honesty'), ('v_priority', 'kindness'), ('v_priority', 'goals'), ('v_priority', 'humour'),
        ('l_weekend', 'out'), ('l_weekend', 'mix'), ('l_weekend', 'home'), ('l_weekend', 'explore'),
        ('l_rhythm', 'early'), ('l_rhythm', 'night'), ('l_rhythm', 'depends'),
        ('l_children', 'yes'), ('l_children', 'open'), ('l_children', 'no'), ('l_children', 'unsure'),
        ('c_contact', 'often'), ('c_contact', 'few'), ('c_contact', 'calls'), ('c_contact', 'in_person'),
        ('c_disagree', 'now'), ('c_disagree', 'time'), ('c_disagree', 'write'), ('c_disagree', 'light')
      ))
    ) then raise exception 'invalid compatibility answer' using errcode = '22023'; end if;
    delete from public.compatibility_answers where account_id = member_id;
    insert into public.compatibility_answers (account_id, question_id, option_id)
    select member_id, item->>'question_id', item->>'option_id'
    from jsonb_array_elements(coalesce(profile_data->'answers', '[]'::jsonb)) item;
  else
    raise exception 'unsupported profile section' using errcode = '22023';
  end if;
  update public.profiles p set profile_status = case
    when p.display_name is not null and p.gender is not null and p.city is not null
      and p.country is not null and p.bio is not null and p.relationship_intention is not null
      and cardinality(p.interests) between 3 and 8
      and exists (select 1 from public.preferences pref where pref.account_id = member_id)
      and exists (select 1 from public.profile_photos ph where ph.account_id = member_id and ph.moderation_state = 'approved')
    then 'complete' else 'draft' end
  where p.account_id = member_id;
end;
$$;
revoke all on function public.save_my_profile_step(text, jsonb) from public, anon;
grant execute on function public.save_my_profile_step(text, jsonb) to authenticated;

create function public.refresh_profile_completion() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare member_id uuid;
begin
  if tg_op = 'DELETE' then member_id := old.account_id; else member_id := new.account_id; end if;
  update public.profiles p set profile_status = case
    when p.display_name is not null and p.gender is not null and p.city is not null
      and p.country is not null and p.bio is not null and p.relationship_intention is not null
      and cardinality(p.interests) between 3 and 8
      and exists (select 1 from public.preferences pref where pref.account_id = member_id)
      and exists (select 1 from public.profile_photos ph where ph.account_id = member_id and ph.moderation_state = 'approved')
    then 'complete' else 'draft' end
  where p.account_id = member_id;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
create trigger profile_photo_completion_refresh
  after insert or update of moderation_state or delete on public.profile_photos
  for each row execute function public.refresh_profile_completion();

create function public.reorder_my_profile_photos(photo_ids uuid[]) returns void
language plpgsql security definer set search_path = ''
as $$
declare member_id uuid := auth.uid(); total_count integer; distinct_count integer;
begin
  if member_id is null or not public.is_active_member() then
    raise exception 'member access unavailable' using errcode = '42501';
  end if;
  select count(*), count(distinct x) into total_count, distinct_count
    from unnest(photo_ids) x;
  if total_count > 6 or total_count <> distinct_count or exists (
    select 1 from unnest(photo_ids) x
    where not exists (select 1 from public.profile_photos p
      where p.id = x and p.account_id = member_id)
  ) or (select count(*) from public.profile_photos p where p.account_id = member_id) <> total_count then
    raise exception 'invalid photo order' using errcode = '22023';
  end if;
  set constraints profile_photos_account_position_key deferred;
  update public.profile_photos p set position = ordinality - 1
  from unnest(photo_ids) with ordinality as ordered(id, ordinality)
  where p.id = ordered.id and p.account_id = member_id;
end;
$$;
revoke all on function public.reorder_my_profile_photos(uuid[]) from public, anon;
grant execute on function public.reorder_my_profile_photos(uuid[]) to authenticated;
