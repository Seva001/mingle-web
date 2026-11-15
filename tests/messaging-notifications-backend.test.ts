import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const migration = readFileSync("supabase/migrations/20261110000006_messaging_notifications.sql", "utf8");
const messagingActions = readFileSync("lib/messaging/actions.ts", "utf8");
const notificationActions = readFileSync("lib/notifications/actions.ts", "utf8");
const chats = readFileSync("components/member/live-chats-view.tsx", "utf8");
const notifications = readFileSync("components/member/live-notifications-view.tsx", "utf8");

describe("Batch G messaging and notifications security contract", () => {
  it("limits conversations and messages to active members of the current mutual connection", () => {
    expect(migration).toContain("create function public.is_valid_conversation_member");
    expect(migration).toContain("join public.connections x on x.id = c.connection_id");
    expect(migration).toContain("public.is_active_member()");
    expect(migration).toContain("not exists (select 1 from public.member_blocks");
    expect(migration).toContain("create policy messages_read_valid_connection");
    expect(migration).toContain("create function public.send_conversation_message");
    expect(migration).toContain("create function public.unmatch_member");
    expect(migration).toContain("on delete set null");
  });

  it("enforces message bounds, rate limits, cursor pagination and scoped read receipts", () => {
    expect(migration).toContain("char_length(clean_body) not between 1 and 5000");
    expect(migration).toContain("interval '60 seconds'");
    expect(migration).toContain(">= 20");
    expect(migration).toContain("before_created_at");
    expect(migration).toContain("create function public.mark_conversation_read");
    expect(migration).toContain("related_conversation_id = target_conversation_id");
    expect(chats).toContain("postgres_changes");
    expect(chats).toContain("loadOlderConversationMessagesAction");
  });

  it("keeps notification events and email outbox separate from member-controlled preferences", () => {
    expect(migration).toContain("create table public.notification_events");
    expect(migration).toContain("create table public.notification_email_outbox");
    expect(migration).toContain("awaiting_provider");
    expect(migration).toContain("create function public.update_my_notification_preferences");
    expect(migration).toContain("create function public.mark_all_my_notifications_read");
    expect(notificationActions).toContain('rpc("update_my_notification_preferences"');
    expect(messagingActions).toContain('rpc("send_conversation_message"');
    expect(notifications).toContain("Save preferences");
  });
});
