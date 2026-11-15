-- MINGLE Batch G: connection-only messaging and in-app/email notification outbox.
-- International-ready: timestamps are stored in UTC; locale/timezone presentation remains client/account scoped.

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid unique references public.connections(id) on delete set null,
  member_one uuid not null references public.accounts(id) on delete cascade,
  member_two uuid not null references public.accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  constraint conversations_distinct_members check (member_one < member_two)
);
create index conversations_member_one_idx on public.conversations(member_one, last_message_at desc nulls last);
create index conversations_member_two_idx on public.conversations(member_two, last_message_at desc nulls last);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, account_id)
);
create index conversation_members_account_idx on public.conversation_members(account_id, conversation_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.accounts(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index messages_conversation_cursor_idx on public.messages(conversation_id, created_at desc, id desc);
create index messages_sender_rate_limit_idx on public.messages(sender_id, created_at desc);

create table public.conversation_reads (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, account_id)
);

create table public.notification_preferences (
  account_id uuid primary key references public.accounts(id) on delete cascade,
  in_app_messages boolean not null default true,
  email_messages boolean not null default true,
  email_product_updates boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.notification_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  related_conversation_id uuid references public.conversations(id) on delete set null,
  category text not null check (category in ('matches','messages','safety','account')),
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 500),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notification_events_account_idx on public.notification_events(account_id, created_at desc, id desc);

-- A separate, minimal email outbox avoids exposing provider jobs to members. No provider is
-- selected in this batch, so jobs remain awaiting_provider until a provider adapter is configured.
create table public.notification_email_outbox (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  event_type text not null check (event_type in ('new_message')),
  template_data jsonb not null default '{}'::jsonb,
  status text not null default 'awaiting_provider' check (status in ('awaiting_provider','queued','processing','sent','failed','suppressed')),
  attempts integer not null default 0 check (attempts between 0 and 20),
  available_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  last_error_code text
);
create index notification_email_outbox_pending_idx on public.notification_email_outbox(status, available_at) where status in ('queued','awaiting_provider');

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_reads enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_events enable row level security;
alter table public.notification_email_outbox enable row level security;

revoke all on public.conversations, public.conversation_members, public.messages,
  public.conversation_reads, public.notification_preferences, public.notification_events, public.notification_email_outbox
  from anon, authenticated;
-- SELECT on messages is intentionally available only through a strict RLS policy for realtime
-- Postgres Changes. All inserts/updates/deletes remain RPC/service-only.
grant select on public.messages to authenticated;
grant all on public.conversations, public.conversation_members, public.messages, public.conversation_reads,
  public.notification_preferences, public.notification_events, public.notification_email_outbox to service_role;

create function public.is_valid_conversation_member(target_conversation_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null
    and public.is_active_member()
    and exists (
      select 1 from public.conversations c
      join public.connections x on x.id = c.connection_id
        and x.member_one = c.member_one and x.member_two = c.member_two
      join public.accounts a1 on a1.id = c.member_one and a1.status = 'active'
      join public.accounts a2 on a2.id = c.member_two and a2.status = 'active'
      where c.id = target_conversation_id
        and auth.uid() in (c.member_one, c.member_two)
        and exists (select 1 from public.conversation_members cm
          where cm.conversation_id = c.id and cm.account_id = auth.uid())
        and not exists (select 1 from public.member_blocks b where
          (b.actor_id = c.member_one and b.target_id = c.member_two)
          or (b.actor_id = c.member_two and b.target_id = c.member_one))
    );
$$;
revoke all on function public.is_valid_conversation_member(uuid) from public, anon;
grant execute on function public.is_valid_conversation_member(uuid) to authenticated;

create policy messages_read_valid_connection on public.messages for select to authenticated
  using (public.is_valid_conversation_member(conversation_id));
create function public.create_conversation_for_connection()
returns trigger language plpgsql security definer set search_path = '' as $$
declare conversation_id uuid;
begin
  insert into public.conversations(connection_id, member_one, member_two)
    values(new.id, new.member_one, new.member_two)
    on conflict (connection_id) do update set connection_id = excluded.connection_id
    returning id into conversation_id;
  insert into public.conversation_members(conversation_id, account_id)
    values (conversation_id, new.member_one), (conversation_id, new.member_two)
    on conflict do nothing;
  insert into public.notification_events(account_id, category, title, body)
    select member.account_id, 'matches', 'A new connection', 'You and another member have connected.'
    from (values (new.member_one), (new.member_two)) as member(account_id)
    where coalesce((select p.in_app_messages from public.notification_preferences p
      where p.account_id = member.account_id), true);
  return new;
end;
$$;
revoke all on function public.create_conversation_for_connection() from public, anon, authenticated;
create trigger connections_create_conversation after insert on public.connections
  for each row execute function public.create_conversation_for_connection();

-- Backfill conversations for mutual connections that existed before this migration.
do $$
declare c record; conversation_id uuid;
begin
  for c in select id, member_one, member_two from public.connections loop
    insert into public.conversations(connection_id, member_one, member_two)
      values(c.id, c.member_one, c.member_two)
      on conflict (connection_id) do nothing returning id into conversation_id;
    if conversation_id is null then
      select id into conversation_id from public.conversations where connection_id = c.id;
    end if;
    insert into public.conversation_members(conversation_id, account_id)
      values(conversation_id, c.member_one), (conversation_id, c.member_two)
      on conflict do nothing;
    conversation_id := null;
  end loop;
end;
$$;

create function public.get_my_conversations(result_limit integer default 30)
returns setof jsonb language plpgsql stable security definer set search_path = '' as $$
declare member_id uuid := auth.uid();
begin
  if member_id is null or not public.is_active_member() then
    raise exception 'member access unavailable' using errcode = '42501';
  end if;
  if result_limit < 1 or result_limit > 50 then raise exception 'invalid page size' using errcode = '22023'; end if;
  return query
  select jsonb_build_object(
    'conversation_id', c.id, 'connection_id', c.connection_id,
    'other_member_id', other_account.id, 'display_name', p.display_name,
    'city', p.city, 'country', p.country,
    'last_message_at', coalesce(c.last_message_at, c.created_at),
    'last_message', (select left(m.body, 180) from public.messages m
      where m.conversation_id = c.id order by m.created_at desc, m.id desc limit 1),
    'unread_count', (select count(*)::integer from public.messages m
      where m.conversation_id = c.id and m.sender_id <> member_id
        and m.created_at > coalesce((select r.last_read_at from public.conversation_reads r
          where r.conversation_id = c.id and r.account_id = member_id), 'epoch'::timestamptz))
  )
  from public.conversations c
  join public.connections x on x.id = c.connection_id
    and x.member_one = c.member_one and x.member_two = c.member_two
  join public.accounts other_account on other_account.id = case when c.member_one = member_id then c.member_two else c.member_one end and other_account.status = 'active'
  join public.profiles p on p.account_id = other_account.id
  where member_id in (c.member_one, c.member_two)
    and public.is_valid_conversation_member(c.id)
  order by coalesce(c.last_message_at, c.created_at) desc, c.id desc
  limit result_limit;
end;
$$;
revoke all on function public.get_my_conversations(integer) from public, anon;
grant execute on function public.get_my_conversations(integer) to authenticated;

create function public.get_conversation_messages(target_conversation_id uuid, before_created_at timestamptz default null, before_message_id uuid default null, result_limit integer default 40)
returns setof jsonb language plpgsql stable security definer set search_path = '' as $$
declare member_id uuid := auth.uid();
begin
  if member_id is null or not public.is_valid_conversation_member(target_conversation_id) then
    raise exception 'conversation unavailable' using errcode = '42501';
  end if;
  if result_limit < 1 or result_limit > 100 then raise exception 'invalid page size' using errcode = '22023'; end if;
  return query
  select jsonb_build_object('id', m.id, 'sender_id', m.sender_id, 'body', m.body, 'created_at', m.created_at)
  from public.messages m
  where m.conversation_id = target_conversation_id
    and (before_created_at is null or (m.created_at, m.id) < (before_created_at, coalesce(before_message_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid)))
  order by m.created_at desc, m.id desc limit result_limit;
end;
$$;
revoke all on function public.get_conversation_messages(uuid, timestamptz, uuid, integer) from public, anon;
grant execute on function public.get_conversation_messages(uuid, timestamptz, uuid, integer) to authenticated;

create function public.send_conversation_message(target_conversation_id uuid, message_body text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare member_id uuid := auth.uid(); clean_body text; inserted_id uuid; inserted_at timestamptz; recipient_id uuid; prefs public.notification_preferences%rowtype;
begin
  if member_id is null or not public.is_valid_conversation_member(target_conversation_id) then
    raise exception 'conversation unavailable' using errcode = '42501';
  end if;
  clean_body := trim(coalesce(message_body, ''));
  if char_length(clean_body) not between 1 and 5000 then
    raise exception 'message must contain 1 to 5000 characters' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(member_id::text || ':message-rate', 0));
  if (select count(*) from public.messages m where m.sender_id = member_id and m.created_at > now() - interval '60 seconds') >= 20 then
    raise exception 'message rate limit reached; try again shortly' using errcode = '54000';
  end if;
  select case when c.member_one = member_id then c.member_two else c.member_one end
    into recipient_id from public.conversations c where c.id = target_conversation_id;
  insert into public.messages(conversation_id, sender_id, body)
    values(target_conversation_id, member_id, clean_body)
    returning id, created_at into inserted_id, inserted_at;
  update public.conversations set last_message_at = greatest(coalesce(last_message_at, inserted_at), inserted_at) where id = target_conversation_id;
  select * into prefs from public.notification_preferences where account_id = recipient_id;
  if coalesce(prefs.in_app_messages, true) then
    insert into public.notification_events(account_id, related_conversation_id, category, title, body)
      values(recipient_id, target_conversation_id, 'messages', 'New message', 'You have a new message.');
  end if;
  if coalesce(prefs.email_messages, true) then
    insert into public.notification_email_outbox(account_id, event_type, template_data)
      values(recipient_id, 'new_message', jsonb_build_object('conversation_id', target_conversation_id));
  end if;
  return jsonb_build_object('id', inserted_id, 'created_at', inserted_at);
end;
$$;
revoke all on function public.send_conversation_message(uuid, text) from public, anon;
grant execute on function public.send_conversation_message(uuid, text) to authenticated;

create function public.mark_conversation_read(target_conversation_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.is_valid_conversation_member(target_conversation_id) then
    raise exception 'conversation unavailable' using errcode = '42501';
  end if;
  insert into public.conversation_reads(conversation_id, account_id, last_read_at)
    values(target_conversation_id, auth.uid(), now())
  on conflict (conversation_id, account_id) do update set last_read_at = excluded.last_read_at;
  update public.notification_events set read_at = coalesce(read_at, now())
    where account_id = auth.uid() and related_conversation_id = target_conversation_id and category = 'messages' and read_at is null;
end;
$$;
revoke all on function public.mark_conversation_read(uuid) from public, anon;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

create function public.unmatch_member(target_account_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare member_id uuid := auth.uid(); pair_one uuid; pair_two uuid;
begin
  if member_id is null or not public.is_active_member() or target_account_id = member_id then
    raise exception 'member action unavailable' using errcode = '42501';
  end if;
  pair_one := least(member_id, target_account_id); pair_two := greatest(member_id, target_account_id);
  delete from public.connections where member_one = pair_one and member_two = pair_two;
  if not found then raise exception 'connection not found' using errcode = 'P0002'; end if;
  delete from public.member_likes where (actor_id = member_id and target_id = target_account_id)
    or (actor_id = target_account_id and target_id = member_id);
  delete from public.saved_profiles where (account_id = member_id and saved_account_id = target_account_id)
    or (account_id = target_account_id and saved_account_id = member_id);
end;
$$;
revoke all on function public.unmatch_member(uuid) from public, anon;
grant execute on function public.unmatch_member(uuid) to authenticated;

create function public.get_my_notifications(result_limit integer default 50)
returns setof jsonb language plpgsql stable security definer set search_path = '' as $$
declare member_id uuid := auth.uid();
begin
  if member_id is null or not public.is_active_member() then raise exception 'member access unavailable' using errcode = '42501'; end if;
  if result_limit < 1 or result_limit > 100 then raise exception 'invalid page size' using errcode = '22023'; end if;
  return query select jsonb_build_object('id', n.id, 'category', n.category, 'title', n.title,
    'body', n.body, 'created_at', n.created_at, 'read', n.read_at is not null)
    from public.notification_events n where n.account_id = member_id
    order by n.created_at desc, n.id desc limit result_limit;
end;
$$;
revoke all on function public.get_my_notifications(integer) from public, anon;
grant execute on function public.get_my_notifications(integer) to authenticated;

create function public.mark_my_notification_read(target_notification_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.is_active_member() then raise exception 'member access unavailable' using errcode = '42501'; end if;
  update public.notification_events set read_at = coalesce(read_at, now())
    where id = target_notification_id and account_id = auth.uid();
end;
$$;
revoke all on function public.mark_my_notification_read(uuid) from public, anon;
grant execute on function public.mark_my_notification_read(uuid) to authenticated;

create function public.mark_all_my_notifications_read()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.is_active_member() then raise exception 'member access unavailable' using errcode = '42501'; end if;
  update public.notification_events set read_at = now() where account_id = auth.uid() and read_at is null;
end;
$$;
revoke all on function public.mark_all_my_notifications_read() from public, anon;
grant execute on function public.mark_all_my_notifications_read() to authenticated;

create function public.update_my_notification_preferences(p_in_app_messages boolean, p_email_messages boolean, p_email_product_updates boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.is_active_member() then raise exception 'member access unavailable' using errcode = '42501'; end if;
  insert into public.notification_preferences(account_id, in_app_messages, email_messages, email_product_updates, updated_at)
    values(auth.uid(), p_in_app_messages, p_email_messages, p_email_product_updates, now())
  on conflict (account_id) do update set in_app_messages = excluded.in_app_messages,
    email_messages = excluded.email_messages, email_product_updates = excluded.email_product_updates,
    updated_at = now();
end;
$$;
revoke all on function public.update_my_notification_preferences(boolean, boolean, boolean) from public, anon;
grant execute on function public.update_my_notification_preferences(boolean, boolean, boolean) to authenticated;

create function public.get_my_notification_preferences()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is null or not public.is_active_member() then raise exception 'member access unavailable' using errcode = '42501'; end if;
  select jsonb_build_object('in_app_messages', p.in_app_messages, 'email_messages', p.email_messages,
    'email_product_updates', p.email_product_updates) into result
    from public.notification_preferences p where p.account_id = auth.uid();
  return coalesce(result, jsonb_build_object('in_app_messages', true, 'email_messages', true, 'email_product_updates', false));
end;
$$;
revoke all on function public.get_my_notification_preferences() from public, anon;
grant execute on function public.get_my_notification_preferences() to authenticated;

-- Enable Postgres Changes for the messages table where the standard Supabase publication exists.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;
