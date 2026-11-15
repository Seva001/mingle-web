"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getActiveClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: account } = await supabase.from("accounts").select("status").eq("id", user.id).maybeSingle();
  return account?.status === "active" ? supabase : null;
}

export async function sendMessageAction(conversationId: string, body: string) {
  if (!/^[0-9a-f-]{36}$/i.test(conversationId) || typeof body !== "string" || body.trim().length < 1 || body.trim().length > 5000) {
    return { ok: false as const, error: "Enter a message between 1 and 5,000 characters." };
  }
  const supabase = await getActiveClient();
  if (!supabase) return { ok: false as const, error: "Your member session is unavailable." };
  const { data, error } = await supabase.rpc("send_conversation_message", {
    target_conversation_id: conversationId, message_body: body.trim(),
  });
  if (error) return { ok: false as const, error: error.message.includes("rate limit") ? "You’re sending messages too quickly. Please wait a moment." : "This conversation is no longer available, or the message could not be sent." };
  revalidatePath("/chats");
  return { ok: true as const, message: data as { id: string; created_at: string } };
}

export async function markConversationReadAction(conversationId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) return { ok: false as const };
  const supabase = await getActiveClient();
  if (!supabase) return { ok: false as const };
  const { error } = await supabase.rpc("mark_conversation_read", { target_conversation_id: conversationId });
  revalidatePath("/chats");
  revalidatePath("/notifications");
  return { ok: !error };
}

export async function unmatchMemberAction(targetAccountId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(targetAccountId)) return { ok: false as const, error: "Invalid member." };
  const supabase = await getActiveClient();
  if (!supabase) return { ok: false as const, error: "Your member session is unavailable." };
  const { error } = await supabase.rpc("unmatch_member", { target_account_id: targetAccountId });
  revalidatePath("/chats");
  revalidatePath("/connections");
  return error ? { ok: false as const, error: "The connection could not be removed." } : { ok: true as const };
}

export async function loadConversationMessagesAction(conversationId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) return { ok: false as const, messages: [] };
  const supabase = await getActiveClient();
  if (!supabase) return { ok: false as const, messages: [] };
  const { data, error } = await supabase.rpc("get_conversation_messages", {
    target_conversation_id: conversationId, before_created_at: null, before_message_id: null, result_limit: 60,
  });
  if (error) return { ok: false as const, messages: [] };
  const messages = ((data ?? []) as unknown as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id), senderId: String(row.sender_id), body: String(row.body), createdAt: String(row.created_at),
  })).reverse();
  return { ok: true as const, messages };
}

export async function loadOlderConversationMessagesAction(conversationId: string, beforeCreatedAt: string, beforeMessageId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(conversationId) || !beforeCreatedAt || !/^[0-9a-f-]{36}$/i.test(beforeMessageId)) {
    return { ok: false as const, messages: [] };
  }
  const supabase = await getActiveClient();
  if (!supabase) return { ok: false as const, messages: [] };
  const { data, error } = await supabase.rpc("get_conversation_messages", {
    target_conversation_id: conversationId, before_created_at: beforeCreatedAt, before_message_id: beforeMessageId, result_limit: 60,
  });
  if (error) return { ok: false as const, messages: [] };
  const messages = ((data ?? []) as unknown as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id), senderId: String(row.sender_id), body: String(row.body), createdAt: String(row.created_at),
  })).reverse();
  return { ok: true as const, messages };
}

export async function checkConversationAccessAction(conversationId: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) return false;
  const supabase = await getActiveClient();
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("is_valid_conversation_member", { target_conversation_id: conversationId });
  return !error && data === true;
}
