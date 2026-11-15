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

export async function markNotificationReadAction(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false as const };
  const supabase = await getActiveClient();
  if (!supabase) return { ok: false as const };
  const { error } = await supabase.rpc("mark_my_notification_read", { target_notification_id: id });
  revalidatePath("/notifications");
  return { ok: !error };
}

export async function markAllNotificationsReadAction() {
  const supabase = await getActiveClient();
  if (!supabase) return { ok: false as const };
  const { error } = await supabase.rpc("mark_all_my_notifications_read");
  revalidatePath("/notifications");
  return { ok: !error };
}

export async function updateNotificationPreferencesAction(values: { inAppMessages: boolean; emailMessages: boolean; emailProductUpdates: boolean }) {
  if (!values || typeof values !== "object" || Object.values(values).some((value) => typeof value !== "boolean")) return { ok: false as const };
  const supabase = await getActiveClient();
  if (!supabase) return { ok: false as const };
  const { error } = await supabase.rpc("update_my_notification_preferences", {
    p_in_app_messages: values.inAppMessages,
    p_email_messages: values.emailMessages,
    p_email_product_updates: values.emailProductUpdates,
  });
  revalidatePath("/notifications");
  return { ok: !error };
}
