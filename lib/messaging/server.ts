import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ConversationSummary = {
  conversationId: string;
  otherMemberId: string;
  displayName: string;
  city: string | null;
  country: string | null;
  lastMessageAt: string;
  lastMessage: string | null;
  unreadCount: number;
};
export type ConversationMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

async function getActiveClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: account } = await supabase.from("accounts").select("status").eq("id", user.id).maybeSingle();
  return account?.status === "active" ? { supabase, userId: user.id } : null;
}

export async function getMyConversations(): Promise<ConversationSummary[]> {
  const session = await getActiveClient();
  if (!session) return [];
  const { data, error } = await session.supabase.rpc("get_my_conversations", { result_limit: 50 });
  if (error) throw new Error("Conversations could not be loaded.");
  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map((row) => ({
    conversationId: String(row.conversation_id),
    otherMemberId: String(row.other_member_id),
    displayName: String(row.display_name ?? "MINGLE member"),
    city: row.city == null ? null : String(row.city),
    country: row.country == null ? null : String(row.country),
    lastMessageAt: String(row.last_message_at),
    lastMessage: row.last_message == null ? null : String(row.last_message),
    unreadCount: Number(row.unread_count ?? 0),
  }));
}

export async function getConversationMessages(conversationId: string, limit = 40): Promise<ConversationMessage[]> {
  const session = await getActiveClient();
  if (!session) return [];
  const { data, error } = await session.supabase.rpc("get_conversation_messages", {
    target_conversation_id: conversationId,
    before_created_at: null,
    before_message_id: null,
    result_limit: limit,
  });
  if (error) throw new Error("Messages could not be loaded. This conversation may no longer be available.");
  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id), senderId: String(row.sender_id), body: String(row.body), createdAt: String(row.created_at),
  })).reverse();
}

export async function getCurrentMemberContext(): Promise<{ id: string; locale: string; timezone: string } | null> {
  const session = await getActiveClient();
  if (!session) return null;
  const { data } = await session.supabase.from("accounts").select("locale,timezone").eq("id", session.userId).maybeSingle();
  return { id: session.userId, locale: data?.locale ?? "en", timezone: data?.timezone ?? "UTC" };
}
