-- Mingle: remove the paid third-party age-assurance requirement (decision of 14 November 2026).
--
-- What this does
--   * Member access no longer needs a provider-backed age check. The declared date of birth
--     (18+ trigger, per-market minimum age) plus market-enabled plus email state are the gates.
--   * It does NOT make anyone active by itself: an account with no date of birth on file, or one
--     below its market's minimum, or in a market that is not enabled, stays 'pending'.
--   * Blocked statuses (suspended, blocked_underage, deleted) still never auto-clear.
--   * The age_assurance_outcome / age_assurance_checked_at columns and public.verification_records
--     are left in place, unused, so no data is destroyed and a provider can be added later.
--
-- A declared date of birth is not proof of age. Do not describe members as "age-verified".

-- 1. Active no longer requires a passed provider outcome.
alter table public.accounts drop constraint if exists accounts_active_requires_age_assurance;

-- 2. Market policy label: 'declaration' replaces 'provider_required'.
alter table public.market_config drop constraint if exists market_config_age_policy;
update public.market_config set age_assurance_policy = 'declaration';
alter table public.market_config alter column age_assurance_policy set default 'declaration';
alter table public.market_config
  add constraint market_config_age_policy check (age_assurance_policy in ('declaration'));

-- 3. Eligibility recalculation without the provider gate.
create or replace function public.refresh_account_eligibility(target_account_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  email_is_confirmed boolean;
  account_market text;
  market_is_enabled boolean;
  market_age_satisfied boolean;
  current_status text;
begin
  select u.email_confirmed_at is not null into email_is_confirmed
    from auth.users u where u.id = target_account_id;
  select a.market_code, a.status
    into account_market, current_status
    from public.accounts a where a.id = target_account_id for update;
  if not found then return; end if;
  if current_status in ('suspended', 'blocked_underage', 'deleted') then return; end if;
  select coalesce(m.enabled, false) into market_is_enabled
    from public.market_config m where m.code = account_market;
  select coalesce(
      b.date_of_birth <= (current_date - make_interval(years => m.minimum_age))::date,
      false
    ) into market_age_satisfied
    from public.market_config m
    left join public.account_birth_dates b on b.account_id = target_account_id
    where m.code = account_market;
  if coalesce(email_is_confirmed, false)
    and coalesce(market_is_enabled, false)
    and coalesce(market_age_satisfied, false) then
    update public.accounts set status = 'active' where id = target_account_id;
  else
    update public.accounts set status = 'pending' where id = target_account_id;
  end if;
end;
$$;

-- 4. Database guard without the provider gate. A declared date of birth that meets the market
--    minimum is still mandatory, so a missing or under-age declaration can never become active.
create or replace function public.guard_account_activation() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  email_is_confirmed boolean;
  market_is_enabled boolean;
  market_age_satisfied boolean;
begin
  if new.status = 'active' then
    if tg_op = 'UPDATE' and old.status in ('suspended', 'blocked_underage', 'deleted') then
      raise exception 'blocked account status requires a separate reviewed restoration workflow' using errcode = '23514';
    end if;
    select u.email_confirmed_at is not null into email_is_confirmed
      from auth.users u where u.id = new.id;
    select coalesce(m.enabled, false) into market_is_enabled
      from public.market_config m where m.code = new.market_code;
    select coalesce(
        b.date_of_birth <= (current_date - make_interval(years => m.minimum_age))::date,
        false
      ) into market_age_satisfied
      from public.market_config m
      left join public.account_birth_dates b on b.account_id = new.id
      where m.code = new.market_code;
    if not coalesce(email_is_confirmed, false)
      or not coalesce(market_is_enabled, false)
      or not coalesce(market_age_satisfied, false) then
      raise exception 'account eligibility requirements are not satisfied' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists accounts_guard_activation on public.accounts;
create trigger accounts_guard_activation before insert or update of status, market_code
  on public.accounts for each row execute function public.guard_account_activation();

-- 5. Staff market configuration no longer requires the admin to hold a passed provider outcome
--    (nobody can, now), and records the 'declaration' policy. Everything else is unchanged.
create or replace function public.admin_configure_market(
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
    trim(p_privacy_version), 'declaration', coalesce(p_allow_cross_market, false), p_retention_days
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

-- 5b. Activate at sign-up. Before, nobody could pass the provider check, so an account sitting at
--     'pending' after sign-up went unnoticed. Now that the only gates are email + market + declared
--     date of birth, evaluate them as soon as the account row exists. This trigger sorts after
--     on_auth_user_created, so the account and its date of birth are already inserted when it runs.
drop trigger if exists on_auth_user_created_eligibility on auth.users;
create trigger on_auth_user_created_eligibility
  after insert on auth.users
  for each row execute function public.handle_auth_user_eligibility_change();

-- 6. Re-evaluate accounts that were waiting only on the provider outcome.
do $$
declare waiting record;
begin
  for waiting in select a.id from public.accounts a where a.status = 'pending' loop
    perform public.refresh_account_eligibility(waiting.id);
  end loop;
end;
$$;

comment on column public.accounts.age_assurance_outcome is
  'Dormant. No provider is integrated; reserved in case one is added later. Not read by access rules.';
comment on column public.accounts.age_assurance_checked_at is
  'Dormant. See age_assurance_outcome.';
