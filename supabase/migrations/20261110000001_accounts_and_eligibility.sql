-- Mingle Batch B: account foundation and fail-closed eligibility.
-- Review and apply only to the dedicated mingle-dev Supabase project.

create table public.market_config (
  code text primary key check (code ~ '^[A-Z]{2,3}$'),
  enabled boolean not null default false,
  minimum_age smallint not null default 18 check (minimum_age >= 18),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.market_config enable row level security;
revoke all on public.market_config from anon, authenticated;

create table public.accounts (
  id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'suspended', 'blocked_underage', 'deleted')),
  age_assurance_outcome text not null default 'not_started'
    check (age_assurance_outcome in ('not_started', 'pending', 'passed', 'failed', 'error')),
  age_assurance_checked_at timestamptz,
  market_code text references public.market_config(code),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_active_requires_age_assurance
    check (status <> 'active' or age_assurance_outcome = 'passed')
);
alter table public.accounts enable row level security;
revoke all on public.accounts from anon, authenticated;
grant select on public.accounts to authenticated;
create policy accounts_select_own on public.accounts
  for select to authenticated using ((select auth.uid()) = id);

-- DOB is a declaration only. It is stored in a table with no browser grants or policies.
create table public.account_birth_dates (
  account_id uuid primary key references public.accounts (id) on delete cascade,
  date_of_birth date not null,
  created_at timestamptz not null default now()
);
alter table public.account_birth_dates enable row level security;
revoke all on public.account_birth_dates from anon, authenticated;

create function public.enforce_adult_birth_date() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.date_of_birth > (current_date - interval '18 years')::date then
    raise exception 'date_of_birth must be 18 or over' using errcode = '23514';
  end if;
  if new.date_of_birth < (current_date - interval '120 years')::date then
    raise exception 'date_of_birth is outside the supported range' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger account_birth_dates_adult_only
  before insert or update of date_of_birth on public.account_birth_dates
  for each row execute function public.enforce_adult_birth_date();

create table public.verification_records (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  kind text not null check (kind in ('age_assurance', 'profile')),
  provider text not null,
  provider_reference text not null,
  outcome text not null check (outcome in ('passed', 'failed', 'error')),
  created_at timestamptz not null default now()
);
create index verification_records_account_id_idx on public.verification_records (account_id);
create unique index verification_records_provider_reference_uidx
  on public.verification_records (provider, provider_reference);
alter table public.verification_records enable row level security;
revoke all on public.verification_records from anon, authenticated;

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger accounts_set_updated_at before update on public.accounts
  for each row execute function public.set_updated_at();
create trigger market_config_set_updated_at before update on public.market_config
  for each row execute function public.set_updated_at();

-- Only this trusted function can promote an account. Market remains disabled until Batch F
-- is reviewed and a launch market is explicitly enabled. The market-specific age floor is
-- checked against the private DOB declaration as an additional gate; it never replaces provider
-- age assurance. Suspended/blocked/deleted never auto-clear.
create function public.refresh_account_eligibility(target_account_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  email_is_confirmed boolean;
  account_market text;
  market_is_enabled boolean;
  market_age_satisfied boolean;
  assurance text;
  current_status text;
begin
  select u.email_confirmed_at is not null into email_is_confirmed
    from auth.users u where u.id = target_account_id;
  select a.market_code, a.age_assurance_outcome, a.status
    into account_market, assurance, current_status
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
    and assurance = 'passed'
    and coalesce(market_is_enabled, false)
    and coalesce(market_age_satisfied, false) then
    update public.accounts set status = 'active' where id = target_account_id;
  else
    update public.accounts set status = 'pending' where id = target_account_id;
  end if;
end;
$$;
revoke all on function public.refresh_account_eligibility(uuid) from public, anon, authenticated;
grant execute on function public.refresh_account_eligibility(uuid) to service_role;

-- New auth users begin pending. Their declared DOB is copied into the restricted table.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare dob_text text;
begin
  insert into public.accounts (id) values (new.id);
  dob_text := new.raw_user_meta_data ->> 'date_of_birth';
  if dob_text is not null and dob_text ~ '^\d{4}-\d{2}-\d{2}$' then
    insert into public.account_birth_dates (account_id, date_of_birth)
      values (new.id, dob_text::date);
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Email confirmation alone never grants access; this only recalculates all eligibility gates.
create function public.handle_auth_user_eligibility_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.refresh_account_eligibility(new.id);
  return new;
end;
$$;
create trigger on_auth_user_eligibility_change
  after update of email_confirmed_at on auth.users
  for each row execute function public.handle_auth_user_eligibility_change();

-- Database-level guard: even a privileged application bug cannot set active unless all gates pass,
-- including the configured market age floor and a DOB declaration in the restricted table.
create function public.guard_account_activation() returns trigger
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
      or new.age_assurance_outcome <> 'passed'
      or not coalesce(market_is_enabled, false)
      or not coalesce(market_age_satisfied, false) then
      raise exception 'account eligibility requirements are not satisfied' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;
create trigger accounts_guard_activation before insert or update of status, age_assurance_outcome, market_code
  on public.accounts for each row execute function public.guard_account_activation();

-- Turning a launch market off immediately closes member access for its accounts.
-- Turning it on only activates accounts that already satisfy email + age-assurance gates.
create function public.handle_market_eligibility_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare affected_account record;
begin
  if old.enabled is distinct from new.enabled
    or old.minimum_age is distinct from new.minimum_age then
    for affected_account in
      select a.id from public.accounts a
      where a.market_code = new.code and a.status in ('pending', 'active')
    loop
      perform public.refresh_account_eligibility(affected_account.id);
    end loop;
  end if;
  return new;
end;
$$;
create trigger market_config_eligibility_change
  after update of enabled, minimum_age on public.market_config
  for each row execute function public.handle_market_eligibility_change();
