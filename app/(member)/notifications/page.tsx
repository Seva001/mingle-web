import type { Metadata } from "next";
import { LiveNotificationsView } from "@/components/member/live-notifications-view";
import { getMyNotificationPreferences, getMyNotifications } from "@/lib/notifications/server";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Notifications" };

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="flex flex-col gap-8"><h1 className="font-display text-headline">Notifications</h1><p className="text-sm text-muted">Sign in to view your notifications.</p></div>;
  const [{ data: account }, items, preferences] = await Promise.all([
    supabase.from("accounts").select("status,locale,timezone").eq("id", user.id).maybeSingle(),
    getMyNotifications(), getMyNotificationPreferences(),
  ]);
  if (account?.status !== "active") return <div className="flex flex-col gap-8"><h1 className="font-display text-headline">Notifications</h1><p className="text-sm text-muted">Notifications are available to eligible active members.</p></div>;
  return <div className="flex flex-col gap-8"><h1 className="font-display text-headline">Notifications</h1><LiveNotificationsView initialItems={items} initialPreferences={preferences} locale={account.locale ?? "en"} timezone={account.timezone ?? "UTC"} /></div>;
}
