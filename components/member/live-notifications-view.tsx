"use client";

import { useMemo, useState, useTransition } from "react";
import { Bell, Check, CheckCheck, Heart, MessageCircle, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { markAllNotificationsReadAction, markNotificationReadAction, updateNotificationPreferencesAction } from "@/lib/notifications/actions";
import type { MemberNotification, NotificationPreferences } from "@/lib/notifications/server";

type Category = MemberNotification["category"];
const FILTERS: { value: "all" | Category; label: string }[] = [
  { value: "all", label: "All" }, { value: "matches", label: "Matches" }, { value: "messages", label: "Messages" }, { value: "safety", label: "Safety" }, { value: "account", label: "Account" },
];
const ICONS: Record<Category, LucideIcon> = { matches: Heart, messages: MessageCircle, safety: ShieldCheck, account: UserRound };

export function LiveNotificationsView({ initialItems, initialPreferences, locale, timezone }: { initialItems: MemberNotification[]; initialPreferences: NotificationPreferences; locale: string; timezone: string }) {
  const [items, setItems] = useState(initialItems);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("all");
  const [notice, setNotice] = useState("");
  const [busy, startTransition] = useTransition();
  const unreadCount = items.filter((item) => !item.read).length;
  const visible = useMemo(() => items.filter((item) => filter === "all" || item.category === filter), [items, filter]);
  function time(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(locale || undefined, { timeZone: timezone || undefined, dateStyle: "medium", timeStyle: "short" }).format(date);
  }
  function markRead(id: string) {
    startTransition(async () => {
      const result = await markNotificationReadAction(id);
      if (result.ok) setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
      else setNotice("This notification could not be updated.");
    });
  }
  function markAllRead() {
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (result.ok) setItems((current) => current.map((item) => ({ ...item, read: true })));
      else setNotice("Notifications could not be updated.");
    });
  }
  function savePreferences() {
    startTransition(async () => {
      const result = await updateNotificationPreferencesAction(preferences);
      setNotice(result.ok ? "Your notification preferences have been saved." : "Your preferences could not be saved.");
    });
  }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-muted">A single place for important activity.</p><p className="mt-1 text-xs text-muted">Notifications are stored in your account and shown using your local settings.</p></div><Button variant="secondary" size="sm" onClick={markAllRead} disabled={unreadCount === 0 || busy}><CheckCheck className="size-4" aria-hidden />Mark all read</Button></div>
    <div className="flex flex-wrap gap-2" aria-label="Notification categories">{FILTERS.map((item) => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className={`rounded-full border px-3.5 py-2 text-xs font-semibold ${filter === item.value ? "border-foreground bg-foreground text-background" : "border-line bg-surface text-muted"}`}>{item.label}{item.value === "all" ? ` (${items.length})` : ""}</button>)}</div>
    <Card padded={false}><div className="flex items-center justify-between border-b border-line px-5 py-4"><div className="flex items-center gap-2"><Bell className="size-4 text-muted" aria-hidden /><h2 className="text-sm font-semibold">Recent activity</h2></div><span className="text-xs text-muted">{unreadCount} unread</span></div>
      {visible.length ? <ul className="divide-y divide-line">{visible.map((item) => { const Icon = ICONS[item.category]; return <li key={item.id} className={`flex gap-3 px-5 py-4 ${item.read ? "" : "bg-foreground/[0.025]"}`}><span className="flex size-[42px] shrink-0 items-center justify-center rounded-full border border-line bg-background"><Icon className="size-4 text-muted" aria-hidden /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{item.title}</p>{!item.read ? <span className="size-2 rounded-full bg-brand" aria-label="Unread" /> : null}</div><p className="mt-1 text-sm leading-6 text-muted">{item.body}</p><p className="mt-2 text-[11px] text-muted">{time(item.createdAt)} · {item.category}</p></div>{!item.read ? <button type="button" onClick={() => markRead(item.id)} disabled={busy} className="self-center rounded-full p-2 text-muted hover:bg-foreground/5" aria-label={`Mark ${item.title} as read`}><Check className="size-4" aria-hidden /></button> : <span className="self-center text-[10px] text-muted">Read</span>}</li>; })}</ul> : <div className="p-8 text-center"><Bell className="mx-auto size-6 text-muted" aria-hidden /><p className="mt-3 text-sm font-semibold">{items.length ? "Nothing in this category" : "You’re all caught up"}</p><p className="mt-1 text-xs text-muted">New activity will appear here when it happens.</p></div>}
    </Card>
    <Card><div className="mb-4"><h2 className="text-sm font-semibold">Notification preferences</h2><p className="mt-1 text-xs leading-5 text-muted">Choose which message and product updates you receive. Email delivery activates when MINGLE configures its transactional email provider.</p></div><div className="space-y-4">
      {[{ key: "inAppMessages" as const, title: "In-app messages and connection alerts", detail: "Show new messages and mutual connections in your MINGLE notifications." }, { key: "emailMessages" as const, title: "Email message alerts", detail: "Queue an email alert when someone sends you a message." }, { key: "emailProductUpdates" as const, title: "Product updates by email", detail: "Occasional platform news and product announcements." }].map((item) => <label key={item.key} className="flex cursor-pointer items-start justify-between gap-4"><span><span className="block text-sm font-medium">{item.title}</span><span className="mt-1 block text-xs leading-5 text-muted">{item.detail}</span></span><input type="checkbox" checked={preferences[item.key]} onChange={(event) => setPreferences((current) => ({ ...current, [item.key]: event.target.checked }))} className="mt-1 size-4 accent-current" /></label>)}
    </div><div className="mt-5 flex justify-end"><Button size="sm" onClick={savePreferences} disabled={busy}>Save preferences</Button></div></Card>
    {notice ? <p role="status" className="text-xs leading-5 text-muted">{notice}</p> : null}
  </div>;
}
