-- Mingle Batch E: reporting, moderation, administrative authorization and audit history.
-- Apply after Batch D. Admin membership is provisioned out-of-band with service_role only.

create table public.admin_memberships (
  account_id uuid primary key references public.accounts(id) on delete cascade,
  role text not null check (role in ('admin', 'moderator', 'support')),
  created_at timestamptz not null default now(),
  created_by uuid references public.accounts(id) on delete set null
);
alter table public.admin_memberships enable row level security;
revoke all on public.admin_memberships from anon, authenticated;
grant all on public.admin_memberships to service_role;
-- Deliberately no member-facing SELECT policy: roles are not discoverable through PostgREST.

create table public.safety_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_account_id uuid not null references public.accounts(id) on delete cascade,
  target_account_id uuid references public.accounts(id) on delete set null,
  category text not null check (category in (
    'harassment', 'hate_or_discrimination', 'threats', 'impersonation',
    'inappropriate_content', 'spam_or_scam', 'safety_concern', 'other'
  )),
  details text not null check (char_length(trim(details)) between 20 and 2000),
  status text not null default 'open' check (status in ('open', 'under_review', 'resolved', 'dismissed')),
  priority text not null default 'normal' check (priority in ('normal', 'high', 'urgent')),
  assigned_to uuid references public.accounts(id) on delete set null,
  resolution_note text check (resolution_note is null or char_length(resolution_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint safety_reports_not_self check (target_account_id is null or reporter_account_id <> target_account_id)
);
create index safety_reports_queue_idx on public.safety_reports(status, priority, created_at desc);
create index safety_reports_target_idx on public.safety_reports(target_account_id, created_at desc);
alter table public.safety_reports enable row level security;
revoke all on public.safety_reports from anon, authenticated;

create table public.moderation_audit_events (
  id bigint generated always as identity primary key,
  actor_account_id uuid references public.accounts(id) on delete set null,
  action text not null check (char_length(action) between 1 and 80),
  target_type text not null check (target_type in ('account', 'report', 'profile_photo')),
  target_id text not null check (char_length(target_id) between 1 and 100),
  metadata jsonb not null default '{}'::jsonb check (pg_column_size(metadata) <= 4096),
  created_at timestamptz not null default now()
);
create index moderation_audit_events_created_idx on public.moderation_audit_events(created_at desc);
create index moderation_audit_events_target_idx on public.moderation_audit_events(target_type, target_id, created_at desc);
alter table public.moderation_audit_events enable row level security;
revoke all on public.moderation_audit_events from anon, authenticated;

create trigger safety_reports_set_updated_at before update on public.safety_reports
  for each row execute function public.set_updated_at();

-- Security-definer role lookup avoids exposing membership rows to the browser.
create function public.has_admin_role(allowed_roles text[] default array['admin', 'moderator'])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin_memberships m
    join public.accounts a on a.id = m.account_id and a.status = 'active'
    where m.account_id = auth.uid() and m.role = any(allowed_roles)
  );
$$;
revoke all on function public.has_admin_role(text[]) from public, anon;
grant execute on function public.has_admin_role(text[]) to authenticated;

create function public.submit_safety_report(
  target_account_id uuid,
  report_category text,
  report_details text
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  reporter_id uuid := auth.uid();
  created_report_id uuid;
  report_priority text := 'normal';
begin
  if reporter_id is null or not public.is_active_member() then
    raise exception 'active member session required' using errcode = '42501';
  end if;
  if report_category not in ('harassment', 'hate_or_discrimination', 'threats', 'impersonation',
      'inappropriate_content', 'spam_or_scam', 'safety_concern', 'other')
    or char_length(trim(coalesce(report_details, ''))) not between 20 and 2000 then
    raise exception 'invalid report details' using errcode = '22023';
  end if;
  if target_account_id is not null and target_account_id = reporter_id then
    raise exception 'you cannot report your own account' using errcode = '22023';
  end if;
  if target_account_id is not null and not exists (
    select 1 from public.accounts a where a.id = target_account_id
  ) then
    raise exception 'reported account is unavailable' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(reporter_id::text || ':safety-reports', 0));
  if ( (select count(*) from public.safety_reports r
      where r.reporter_account_id = reporter_id and r.created_at > now() - interval '24 hours')) >= 5 then
    raise exception 'daily report limit reached' using errcode = '42900';
  end if;
  if report_category in ('threats', 'safety_concern') then report_priority := 'high'; end if;
  insert into public.safety_reports(reporter_account_id, target_account_id, category, details, priority)
  values(reporter_id, target_account_id, report_category, trim(report_details), report_priority)
  returning id into created_report_id;
  return created_report_id;
end;
$$;
revoke all on function public.submit_safety_report(uuid, text, text) from public, anon;
grant execute on function public.submit_safety_report(uuid, text, text) to authenticated;

create function public.get_admin_moderation_queue(result_limit integer default 50)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result_payload jsonb;
begin
  if not public.has_admin_role(array['admin', 'moderator', 'support']) then
    raise exception 'staff permission required' using errcode = '42501';
  end if;
  if result_limit < 1 or result_limit > 100 then
    raise exception 'invalid queue size' using errcode = '22023';
  end if;
  select jsonb_build_object(
    'reports', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'category', r.category, 'details', r.details, 'status', r.status,
        'priority', r.priority, 'created_at', r.created_at,
        'target_account_id', case when public.has_admin_role(array['admin']) then r.target_account_id else null end,
        'target_display_name', target_profile.display_name
      ) order by case r.priority when 'urgent' then 0 when 'high' then 1 else 2 end, r.created_at)
      from (select * from public.safety_reports where status in ('open', 'under_review')
        order by case priority when 'urgent' then 0 when 'high' then 1 else 2 end, created_at
        limit result_limit) r
      left join public.profiles target_profile on target_profile.account_id = r.target_account_id
    ), '[]'::jsonb),
    'pending_photos', case when public.has_admin_role(array['admin', 'moderator']) then coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', pending.id, 'display_name', pending.display_name,
        'storage_path', pending.storage_path, 'created_at', pending.created_at
      ) order by pending.created_at)
      from (select ph.id, ph.account_id, p.display_name, ph.storage_path, ph.created_at
        from public.profile_photos ph join public.profiles p on p.account_id = ph.account_id
        where ph.moderation_state = 'pending' order by ph.created_at limit result_limit) pending
    ), '[]'::jsonb) else '[]'::jsonb end
  ) into result_payload;
  return result_payload;
end;
$$;
revoke all on function public.get_admin_moderation_queue(integer) from public, anon;
grant execute on function public.get_admin_moderation_queue(integer) to authenticated;

create function public.admin_review_profile_photo(photo_id uuid, decision text, moderator_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare reviewer_id uuid := auth.uid(); photo_owner uuid;
begin
  if reviewer_id is null or not public.has_admin_role(array['admin', 'moderator']) then
    raise exception 'moderator permission required' using errcode = '42501';
  end if;
  if decision not in ('approved', 'rejected') or char_length(coalesce(moderator_note, '')) > 500 then
    raise exception 'invalid moderation decision' using errcode = '22023';
  end if;
  update public.profile_photos set moderation_state = decision
    where id = photo_id and moderation_state = 'pending' returning account_id into photo_owner;
  if photo_owner is null then raise exception 'pending photo not found' using errcode = 'P0002'; end if;
  insert into public.moderation_audit_events(actor_account_id, action, target_type, target_id, metadata)
  values(reviewer_id, 'profile_photo_' || decision, 'profile_photo', photo_id::text,
    jsonb_build_object('account_id', photo_owner, 'note', left(coalesce(moderator_note, ''), 500)));
end;
$$;
revoke all on function public.admin_review_profile_photo(uuid, text, text) from public, anon;
grant execute on function public.admin_review_profile_photo(uuid, text, text) to authenticated;

create function public.admin_update_report(report_id uuid, new_status text, resolution text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare reviewer_id uuid := auth.uid(); old_status text;
begin
  if reviewer_id is null or not public.has_admin_role(array['admin', 'moderator', 'support']) then
    raise exception 'staff permission required' using errcode = '42501';
  end if;
  if new_status not in ('under_review', 'resolved', 'dismissed')
    or char_length(coalesce(resolution, '')) > 1000 then
    raise exception 'invalid report update' using errcode = '22023';
  end if;
  update public.safety_reports set status = new_status,
    assigned_to = case when new_status = 'under_review' then reviewer_id else assigned_to end,
    resolution_note = case when new_status in ('resolved', 'dismissed') then nullif(trim(resolution), '') else null end,
    resolved_at = case when new_status in ('resolved', 'dismissed') then now() else null end
  where id = report_id and status in ('open', 'under_review') returning status into old_status;
  if old_status is null then raise exception 'open report not found' using errcode = 'P0002'; end if;
  insert into public.moderation_audit_events(actor_account_id, action, target_type, target_id, metadata)
  values(reviewer_id, 'report_' || new_status, 'report', report_id::text,
    jsonb_build_object('resolution_note', left(coalesce(resolution, ''), 1000)));
end;
$$;
revoke all on function public.admin_update_report(uuid, text, text) from public, anon;
grant execute on function public.admin_update_report(uuid, text, text) to authenticated;

create function public.admin_suspend_member(target_account_id uuid, reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare reviewer_id uuid := auth.uid();
begin
  if reviewer_id is null or not public.has_admin_role(array['admin']) then
    raise exception 'administrator permission required' using errcode = '42501';
  end if;
  if target_account_id = reviewer_id or char_length(trim(coalesce(reason, ''))) not between 10 and 500 then
    raise exception 'invalid suspension request' using errcode = '22023';
  end if;
  update public.accounts set status = 'suspended' where id = target_account_id and status = 'active';
  if not found then raise exception 'active account not found' using errcode = 'P0002'; end if;
  delete from public.connections where member_one = target_account_id
    or member_two = target_account_id;
  delete from public.member_likes where actor_id = target_account_id or target_id = target_account_id;
  delete from public.saved_profiles where account_id = target_account_id or saved_account_id = target_account_id;
  insert into public.moderation_audit_events(actor_account_id, action, target_type, target_id, metadata)
  values(reviewer_id, 'member_suspended', 'account', target_account_id::text,
    jsonb_build_object('reason', trim(reason)));
end;
$$;
revoke all on function public.admin_suspend_member(uuid, text) from public, anon;
grant execute on function public.admin_suspend_member(uuid, text) to authenticated;

create function public.get_admin_audit_events(result_limit integer default 50)
returns setof jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.has_admin_role(array['admin']) then
    raise exception 'administrator permission required' using errcode = '42501';
  end if;
  if result_limit < 1 or result_limit > 100 then
    raise exception 'invalid audit page size' using errcode = '22023';
  end if;
  return query select jsonb_build_object(
    'id', e.id, 'actor_account_id', e.actor_account_id, 'action', e.action,
    'target_type', e.target_type, 'target_id', e.target_id,
    'metadata', e.metadata, 'created_at', e.created_at
  ) from public.moderation_audit_events e order by e.created_at desc limit result_limit;
end;
$$;
revoke all on function public.get_admin_audit_events(integer) from public, anon;
grant execute on function public.get_admin_audit_events(integer) to authenticated;

-- Append-only means no direct UPDATE/DELETE grants; even staff use narrowly scoped RPCs.
-- Provision the first admin out-of-band using the Supabase SQL editor/service_role, never via signup.
