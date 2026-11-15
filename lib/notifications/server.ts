import "server-only";
import { createClient } from "@/lib/supabase/server";

export type MemberNotification = { id: string; category: "matches" | "messages" | "safety" | "account"; title: string; body: string; createdAt: string; read: boolean };
export type NotificationPreferences = { inAppMessages: boolean; emailMessages: boolean; emailProductUpdates: boolean };

async function getActiveClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: account } = await supabase.from("accounts").select("status").eq("id", user.id).maybeSingle();
  return account?.status === "active" ? supabase : null;
}

export async function getMyNotifications(): Promise<MemberNotification[]> {
  const supabase = await getActiveClient();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_my_notifications", { result_limit: 100 });
  if (error) throw new Error("Notifications could not be loaded.");
  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id), category: row.category as MemberNotification["category"], title: String(row.title),
    body: String(row.body), createdAt: String(row.created_at), read: Boolean(row.read),
  }));
}

export async function getMyNotificationPreferences(): Promise<NotificationPreferences> {
  const supabase = await getActiveClient();
  if (!supabase) return { inAppMessages: true, emailMessages: true, emailProductUpdates: false };
  const { data, error } = await supabase.rpc("get_my_notification_preferences");
  if (error || !data) return { inAppMessages: true, emailMessages: true, emailProductUpdates: false };
  const value = data as Record<string, unknown>;
  return { inAppMessages: Boolean(value.in_app_messages), emailMessages: Boolean(value.email_messages), emailProductUpdates: Boolean(value.email_product_updates) };
}
