-- MINGLE Batch F: controlled markets, per-market eligibility policy, consent records,
-- and member locale/timezone preferences. No country is enabled by this migration.

alter table public.market_config
  add column if not exists display_name text not null default 'Market',
  add column if not exists default_locale text not null default 'en',
  add column if not exists supported_locales text[] not null default array['en']::text[],
  add column if not exists default_timezone text not null default 'UTC',
  add column if not exists terms_version text not null default 'draft',
  add column if not exists privacy_version text not null default 'draft',
  add column if not exists age_assurance_policy text not null default 'provider_required',
  add column if not exists allow_cross_market boolean not null default false,
  add column if not exists retention_days integer;

alter table public.market_config
  add constraint market_config_display_name_length check (char_length(trim(display_name)) between 2 and 60),
  add constraint market_config_locales_nonempty check (cardinality(supported_locales) between 1 and 20),
  add constraint market_config_default_locale_supported check (default_locale = any(supported_locales)),
  add constraint market_config_locale_format check (
    default_locale ~ '^[a-z]{2,3}(-[A-Z]{2})?$'
    and array_position(supported_locales, null) is null
  ),
  add constraint market_config_timezone_nonempty check (char_length(default_timezone) between 1 and 80),
  add constraint market_config_terms_version_length check (char_length(trim(terms_version)) between 1 and 40),
  add constraint market_config_privacy_version_length check (char_length(trim(privacy_version)) between 1 and 40),
  add constraint market_config_age_policy check (age_assurance_policy in ('provider_required')),
  add constraint market_config_minimum_age_upper_bound check (minimum_age between 18 and 99),
  add constraint market_config_retention_days check (retention_days is null or retention_days between 1 and 36500);

alter table public.accounts
  add column if not exists locale text not null default 'en',
  add column if not exists timezone text not null default 'UTC';

-- The public profile country label is derived from the selected market, never free text.
create function public.sync_profile_country_from_market() returns trigger
language plpgsql security definer set search_path = '' as $$
declare market_name text;
begin
  select m.display_name into market_name
  from public.accounts a join public.market_config m on m.code = a.market_code
  where a.id = new.account_id;
  if market_name is null then
    raise exception 'profile market is unavailable' using errcode = '23514';
  end if;
  new.country := market_name;
  return new;
end;
$$;
create trigger profiles_country_from_market
  before insert or update of account_id, country on public.profiles
  for each row execute function public.sync_profile_country_from_market();

create function public.refresh_profile_market_labels() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles p set country = new.display_name
  from public.accounts a
  where a.id = p.account_id and a.market_code = new.code;
  return new;
end;
$$;
create trigger market_display_name_refresh_profiles
  after update of display_name on public.market_config
  for each row when (old.display_name is distinct from new.display_name)
  execute function public.refresh_profile_market_labels();

create table public.market_consent_records (
  id bigint generated always as identity primary key,
  account_id uuid not null references public.accounts(id) on delete cascade,
  market_code text not null references public.market_config(code),
  consent_type text not null check (consent_type in ('terms', 'privacy')),
  policy_version text not null check (char_length(policy_version) between 1 and 40),
  locale text not null check (char_length(locale) between 2 and 12),
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index market_consent_records_account_idx
  on public.market_consent_records(account_id, accepted_at desc);
alter table public.market_consent_records enable row level security;
revoke all on public.market_consent_records from anon, authenticated;
grant all on public.market_consent_records to service_role;

-- A public projection exposes only explicitly enabled launch markets. Draft/disabled
-- configurations, retention settings and internal policy keys are never returned.
create function public.get_enabled_markets()
returns setof jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'code', m.code,
    'display_name', m.display_name,
    'minimum_age', m.minimum_age,
    'default_locale', m.default_locale,
    'supported_locales', m.supported_locales,
    'default_timezone', m.default_timezone,
    'terms_version', m.terms_version,
    'privacy_version', m.privacy_version
  )
  from public.market_config m
  where m.enabled = true
  order by m.display_name;
$$;
revoke all on function public.get_enabled_markets() from public;
grant execute on function public.get_enabled_markets() to anon, authenticated;

-- Staff may configure a market only after the owner/legal team has supplied its reviewed
-- policy values. New markets default disabled; enabling is always an explicit argument.
alter table public.moderation_audit_events drop constraint moderation_audit_events_target_type_check;
alter table public.moderation_audit_events add constraint moderation_audit_events_target_type_check
  check (target_type in ('account', 'report', 'profile_photo', 'market'));
create function public.admin_configure_market(
  p_code text,
  p_display_name text,
  p_enabled boolean,
  p_minimum_age integer,
  p_default_locale text,
  p_supported_locales text[],
  p_default_timezone text,
  p_terms_version text,
  p_privacy_version text,
  p_allow_cross_market boolean default false,
  p_retention_days integer default null
) returns void language plpgsql security definer set search_path = '' as $$
declare actor_id uuid := auth.uid();
begin
  if actor_id is null or not exists (
    select 1 from public.admin_memberships staff
    join public.accounts admin_account on admin_account.id = staff.account_id
    join auth.users auth_user on auth_user.id = admin_account.id
    where staff.account_id = actor_id and staff.role = 'admin'
      and admin_account.status not in ('suspended', 'blocked_underage', 'deleted')
      and admin_account.age_assurance_outcome = 'passed'
      and auth_user.email_confirmed_at is not null
  ) then
    raise exception 'administrator permission required' using errcode = '42501';
  end if;
  if p_code is null or p_display_name is null or p_minimum_age is null or p_default_locale is null
    or p_supported_locales is null or p_default_timezone is null
    or p_terms_version is null or p_privacy_version is null
    or p_code !~ '^[A-Z]{2}$'
    or char_length(trim(coalesce(p_display_name, ''))) not between 2 and 60
    or p_minimum_age < 18 or p_minimum_age > 99
    or p_default_locale !~ '^[a-z]{2,3}(-[A-Z]{2})?$'
    or cardinality(p_supported_locales) not between 1 and 20
    or p_default_locale <> all(p_supported_locales)
    or exists (select 1 from unnest(p_supported_locales) as locales(locale) where locale is null or locale !~ '^[a-z]{2,3}(-[A-Z]{2})?$')
    or cardinality(p_supported_locales) <> (select count(distinct locale) from unnest(p_supported_locales) as locales(locale))
    or not exists (select 1 from pg_catalog.pg_timezone_names z where z.name = p_default_timezone)
    or char_length(trim(coalesce(p_terms_version, ''))) not between 1 and 40
    or char_length(trim(coalesce(p_privacy_version, ''))) not between 1 and 40
    or (p_retention_days is not null and p_retention_days not between 1 and 36500) then
    raise exception 'market configuration failed validation' using errcode = '22023';
  end if;
  if coalesce(p_enabled, false) and (
    lower(trim(p_terms_version)) = 'draft'
    or lower(trim(p_privacy_version)) = 'draft'
    or p_retention_days is null
  ) then
    raise exception 'enabled markets require reviewed policy versions and a retention period' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.accounts existing_accounts
    where existing_accounts.market_code = p_code
      and not (existing_accounts.locale = any(p_supported_locales))
  ) then
    raise exception 'supported locale changes must preserve all existing member locales or migrate them first' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.market_config existing
    join public.accounts existing_accounts on existing_accounts.market_code = existing.code
    where existing.code = p_code and (
      existing.terms_version is distinct from p_terms_version
      or existing.privacy_version is distinct from p_privacy_version
    )
  ) then
    raise exception 'policy version changes require a separately reviewed member re-consent workflow' using errcode = '22023';
  end if;
  insert into public.market_config(
    code, display_name, enabled, minimum_age, default_locale, supported_locales,
    default_timezone, terms_version, privacy_version, age_assurance_policy,
    allow_cross_market, retention_days
  ) values (
    p_code, trim(p_display_name), coalesce(p_enabled, false), p_minimum_age,
    p_default_locale, p_supported_locales, p_default_timezone, trim(p_terms_version),
    trim(p_privacy_version), 'provider_required', coalesce(p_allow_cross_market, false), p_retention_days
  ) on conflict (code) do update set
    display_name = excluded.display_name,
    enabled = excluded.enabled,
    minimum_age = excluded.minimum_age,
    default_locale = excluded.default_locale,
    supported_locales = excluded.supported_locales,
    default_timezone = excluded.default_timezone,
    terms_version = excluded.terms_version,
    privacy_version = excluded.privacy_version,
    age_assurance_policy = excluded.age_assurance_policy,
    allow_cross_market = excluded.allow_cross_market,
    retention_days = excluded.retention_days;

  insert into public.moderation_audit_events(actor_account_id, action, target_type, target_id, metadata)
  values(actor_id, 'market_configuration_updated', 'market', p_code,
    jsonb_build_object('enabled', p_enabled, 'minimum_age', p_minimum_age,
      'allow_cross_market', p_allow_cross_market, 'default_locale', p_default_locale));
end;
$$;
revoke all on function public.admin_configure_market(text, text, boolean, integer, text, text[], text, text, text, boolean, integer) from public, anon;
grant execute on function public.admin_configure_market(text, text, boolean, integer, text, text[], text, text, text, boolean, integer) to authenticated;

-- Signup now requires a selected, currently enabled market and explicit policy acknowledgements.
-- Country/market is authoritative from the market code, not a free-text profile country.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  dob_text text;
  requested_market text;
  selected_locale text;
  selected_timezone text;
  selected_market public.market_config%rowtype;
begin
  requested_market := upper(coalesce(new.raw_user_meta_data ->> 'market_code', ''));
  if requested_market !~ '^[A-Z]{2}$' then
    raise exception 'a valid launch market is required' using errcode = '23514';
  end if;
  select * into selected_market from public.market_config m
    where m.code = requested_market and m.enabled = true;
  if not found then
    raise exception 'this market is not currently accepting registrations' using errcode = '23514';
  end if;
  if coalesce(new.raw_user_meta_data ->> 'terms_accepted', 'false') <> 'true'
    or coalesce(new.raw_user_meta_data ->> 'privacy_accepted', 'false') <> 'true' then
    raise exception 'current terms and privacy acknowledgement are required' using errcode = '23514';
  end if;
  selected_locale := coalesce(new.raw_user_meta_data ->> 'locale', selected_market.default_locale);
  if not selected_locale = any(selected_market.supported_locales) then
    selected_locale := selected_market.default_locale;
  end if;
  selected_timezone := coalesce(new.raw_user_meta_data ->> 'timezone', selected_market.default_timezone);
  if not exists (select 1 from pg_catalog.pg_timezone_names z where z.name = selected_timezone) then
    selected_timezone := selected_market.default_timezone;
  end if;

  insert into public.accounts(id, market_code, locale, timezone)
    values(new.id, selected_market.code, selected_locale, selected_timezone);

  dob_text := new.raw_user_meta_data ->> 'date_of_birth';
  if dob_text is not null and dob_text ~ '^\d{4}-\d{2}-\d{2}$' then
    insert into public.account_birth_dates(account_id, date_of_birth)
      values(new.id, dob_text::date);
  end if;

  insert into public.market_consent_records(account_id, market_code, consent_type, policy_version, locale)
    values
      (new.id, selected_market.code, 'terms', selected_market.terms_version, selected_locale),
      (new.id, selected_market.code, 'privacy', selected_market.privacy_version, selected_locale);
  return new;
end;
$$;

-- Member locale/timezone can change, but the account's launch market is fixed at signup.
create function public.get_my_market_settings() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare member_id uuid := auth.uid(); result jsonb;
begin
  if member_id is null or not public.is_active_member() then
    raise exception 'active member session required' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'market_code', a.market_code,
    'market_name', m.display_name,
    'locale', a.locale,
    'timezone', a.timezone,
    'supported_locales', m.supported_locales
  ) into result
  from public.accounts a join public.market_config m on m.code = a.market_code
  where a.id = member_id and m.enabled = true;
  if result is null then raise exception 'market settings unavailable' using errcode = 'P0002'; end if;
  return result;
end;
$$;
revoke all on function public.get_my_market_settings() from public, anon;
grant execute on function public.get_my_market_settings() to authenticated;

create function public.update_my_locale_settings(p_locale text, p_timezone text) returns void
language plpgsql security definer set search_path = '' as $$
declare member_id uuid := auth.uid(); supported text[];
begin
  if member_id is null or not public.is_active_member() then
    raise exception 'active member session required' using errcode = '42501';
  end if;
  select m.supported_locales into supported
  from public.accounts a join public.market_config m on m.code = a.market_code
  where a.id = member_id and m.enabled = true;
  if supported is null or p_locale is null or p_timezone is null
    or not p_locale = any(supported)
    or not exists (select 1 from pg_catalog.pg_timezone_names z where z.name = p_timezone) then
    raise exception 'locale or timezone is not supported' using errcode = '22023';
  end if;
  update public.accounts set locale = p_locale, timezone = p_timezone where id = member_id;
end;
$$;
revoke all on function public.update_my_locale_settings(text, text) from public, anon;
grant execute on function public.update_my_locale_settings(text, text) to authenticated;

-- Candidate discovery and likes remain within one market unless both markets have
-- explicitly opted into cross-market discovery. This prevents accidental global launch.
create or replace function public.get_discovery_candidates(result_limit integer default 24, result_offset integer default 0)
returns setof jsonb language plpgsql stable security definer set search_path = '' as $$
declare member_id uuid := auth.uid();
begin
  if member_id is null or not public.is_active_member() then
    raise exception 'member access unavailable' using errcode = '42501';
  end if;
  if result_limit < 1 or result_limit > 50 or result_offset < 0 or result_offset > 500 then
    raise exception 'invalid discovery page' using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles p where p.account_id = member_id
    and p.profile_status = 'complete' and p.visibility = 'visible') then return; end if;
  return query
  select jsonb_build_object(
    'id', p.account_id, 'display_name', p.display_name, 'gender', p.gender,
    'age', extract(year from age(current_date, bd.date_of_birth))::integer,
    'city', p.city, 'country', p.country, 'bio', p.bio,
    'intention', p.relationship_intention, 'interests', p.interests,
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
  join public.market_config candidate_market on candidate_market.code = a.market_code and candidate_market.enabled
  join public.accounts my_account on my_account.id = member_id
  join public.market_config my_market on my_market.code = my_account.market_code and my_market.enabled
  join public.account_birth_dates bd on bd.account_id = p.account_id
  join public.account_birth_dates my_dob on my_dob.account_id = member_id
  join public.preferences cp on cp.account_id = p.account_id
  join public.profiles mp on mp.account_id = member_id
  join public.preferences mpref on mpref.account_id = member_id
  where p.account_id <> member_id and p.profile_status = 'complete' and p.visibility = 'visible'
    and (candidate_market.code = my_market.code or (candidate_market.allow_cross_market and my_market.allow_cross_market))
    and extract(year from age(current_date, bd.date_of_birth)) between mpref.age_min and mpref.age_max
    and extract(year from age(current_date, my_dob.date_of_birth)) between cp.age_min and cp.age_max
    and extract(year from age(current_date, bd.date_of_birth)) between candidate_market.minimum_age and 120
    and p.gender = any(mpref.interested_in) and mp.gender = any(cp.interested_in)
    and exists (select 1 from public.profile_photos approved where approved.account_id = p.account_id and approved.moderation_state = 'approved')
    and not exists (select 1 from public.member_passes x where x.actor_id = member_id and x.target_id = p.account_id)
    and not exists (select 1 from public.member_likes x where x.actor_id = member_id and x.target_id = p.account_id)
    and not exists (select 1 from public.member_blocks x where
      (x.actor_id = member_id and x.target_id = p.account_id) or (x.actor_id = p.account_id and x.target_id = member_id))
    and not exists (select 1 from public.connections x where
      x.member_one = least(member_id, p.account_id) and x.member_two = greatest(member_id, p.account_id))
  order by p.updated_at desc, p.account_id limit result_limit offset result_offset;
end;
$$;
revoke all on function public.get_discovery_candidates(integer, integer) from public, anon;
grant execute on function public.get_discovery_candidates(integer, integer) to authenticated;

create or replace function public.like_member(target_account_id uuid)
returns table (liked boolean, matched boolean, connection_id uuid)
language plpgsql security definer set search_path = '' as $$
declare member_id uuid := auth.uid(); pair_one uuid; pair_two uuid; new_connection uuid;
begin
  if member_id is null or not public.is_active_member() or target_account_id = member_id then
    raise exception 'member action unavailable' using errcode = '42501';
  end if;
  pair_one := least(member_id, target_account_id); pair_two := greatest(member_id, target_account_id);
  perform pg_advisory_xact_lock(hashtextextended(pair_one::text || ':' || pair_two::text, 0));
  if not exists (
    select 1 from public.profiles me join public.preferences mine on mine.account_id = me.account_id
    join public.profiles them on them.account_id = target_account_id
    join public.preferences theirs on theirs.account_id = them.account_id
    join public.accounts ta on ta.id = them.account_id and ta.status = 'active'
    join public.accounts ma on ma.id = member_id and ma.status = 'active'
    join public.market_config tm on tm.code = ta.market_code and tm.enabled
    join public.market_config mm on mm.code = ma.market_code and mm.enabled
    join public.account_birth_dates dob on dob.account_id = them.account_id
    join public.account_birth_dates my_dob on my_dob.account_id = member_id
    where me.account_id = member_id and me.profile_status = 'complete' and me.visibility = 'visible'
      and them.profile_status = 'complete' and them.visibility = 'visible'
      and (tm.code = mm.code or (tm.allow_cross_market and mm.allow_cross_market))
      and them.gender = any(mine.interested_in) and me.gender = any(theirs.interested_in)
      and extract(year from age(current_date, dob.date_of_birth)) between mine.age_min and mine.age_max
      and extract(year from age(current_date, my_dob.date_of_birth)) between theirs.age_min and theirs.age_max
      and extract(year from age(current_date, dob.date_of_birth)) >= tm.minimum_age
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
  else return query select true, false, null::uuid; end if;
end;
$$;
revoke all on function public.like_member(uuid) from public, anon;
grant execute on function public.like_member(uuid) to authenticated;

create or replace function public.toggle_saved_profile(target_account_id uuid, should_save boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare member_id uuid := auth.uid();
begin
  if member_id is null or not public.is_active_member() or target_account_id = member_id then
    raise exception 'member action unavailable' using errcode = '42501';
  end if;
  if should_save then
    if not exists (
      select 1 from public.profiles p join public.accounts target on target.id = p.account_id
      join public.accounts mine on mine.id = member_id
      join public.market_config tm on tm.code = target.market_code and tm.enabled
      join public.market_config mm on mm.code = mine.market_code and mm.enabled
      where p.account_id = target_account_id and p.visibility = 'visible'
        and p.profile_status = 'complete' and target.status = 'active'
        and (tm.code = mm.code or (tm.allow_cross_market and mm.allow_cross_market))
    ) then raise exception 'profile is unavailable' using errcode = '22023'; end if;
    insert into public.saved_profiles(account_id, saved_account_id) values(member_id, target_account_id)
      on conflict (account_id, saved_account_id) do nothing;
  else
    delete from public.saved_profiles where account_id = member_id and saved_account_id = target_account_id;
  end if;
end;
$$;
revoke all on function public.toggle_saved_profile(uuid, boolean) from public, anon;
grant execute on function public.toggle_saved_profile(uuid, boolean) to authenticated;

comment on table public.market_config is 'Owner/legal-reviewed market allowlist. All markets remain disabled until explicitly configured and enabled.';
comment on table public.market_consent_records is 'Append-only record of the terms and privacy policy versions accepted at account creation.';

-- Saved-profile projections also re-check the current market relationship so a later
-- cross-market opt-out takes effect without exposing a stale cross-market shortlist.
create or replace function public.get_my_saved_profiles()
returns setof jsonb language plpgsql stable security definer set search_path = '' as $$
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
  join public.accounts target on target.id = p.account_id and target.status = 'active'
  join public.accounts mine on mine.id = member_id and mine.status = 'active'
  join public.market_config tm on tm.code = target.market_code and tm.enabled
  join public.market_config mm on mm.code = mine.market_code and mm.enabled
  join public.account_birth_dates bd on bd.account_id = p.account_id
  where s.account_id = member_id and p.visibility = 'visible' and p.profile_status = 'complete'
    and (tm.code = mm.code or (tm.allow_cross_market and mm.allow_cross_market))
    and not exists (select 1 from public.member_blocks b where
      (b.actor_id = member_id and b.target_id = p.account_id) or
      (b.actor_id = p.account_id and b.target_id = member_id))
  order by s.created_at desc;
end;
$$;
revoke all on function public.get_my_saved_profiles() from public, anon;
grant execute on function public.get_my_saved_profiles() to authenticated;
