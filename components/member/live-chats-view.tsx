"use client";

import { useCallback, useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, CheckCheck, ChevronRight, MessageCircle, Search, Send, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { checkConversationAccessAction, loadConversationMessagesAction, loadOlderConversationMessagesAction, markConversationReadAction, sendMessageAction } from "@/lib/messaging/actions";
import type { ConversationMessage, ConversationSummary } from "@/lib/messaging/server";

type Props = { conversations: ConversationSummary[]; memberId: string; locale: string; timezone: string };

function formatTime(value: string, locale: string, timezone: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale || undefined, { timeZone: timezone || undefined, hour: "numeric", minute: "2-digit" }).format(date);
}
function formatDay(value: string, locale: string, timezone: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale || undefined, { timeZone: timezone || undefined, month: "short", day: "numeric" }).format(date);
}

export function LiveChatsView({ conversations, memberId, locale, timezone }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(conversations);
  const [activeId, setActiveId] = useState(conversations[0]?.conversationId ?? "");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [hasOlder, setHasOlder] = useState(false);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, startTransition] = useTransition();
  const active = items.find((item) => item.conversationId === activeId) ?? null;
  const visible = useMemo(() => items.filter((item) => item.displayName.toLowerCase().includes(query.toLowerCase()) || (item.lastMessage ?? "").toLowerCase().includes(query.toLowerCase())), [items, query]);

  const refreshMessages = useCallback(async (conversationId: string) => {
    const result = await loadConversationMessagesAction(conversationId);
    if (result.ok) { setMessages(result.messages); setHasOlder(result.messages.length >= 60); }
    else setNotice("This conversation is no longer available.");
  }, []);

  useEffect(() => {
    if (!activeId) { setMessages([]); setHasOlder(false); return; }
    setHasOlder(false);
    let cancelled = false;
    void loadConversationMessagesAction(activeId).then((result) => {
      if (!cancelled && result.ok) { setMessages(result.messages); setHasOlder(result.messages.length >= 60); }
      if (!cancelled && !result.ok) setNotice("This conversation is no longer available.");
    });
    void markConversationReadAction(activeId).then(() => {
      setItems((current) => current.map((item) => item.conversationId === activeId ? { ...item, unreadCount: 0 } : item));
      router.refresh();
    });
    const supabase = createClient();
    const accessCheck = window.setInterval(() => {
      void checkConversationAccessAction(activeId).then((allowed) => {
        if (!allowed) {
          setMessages([]); setActiveId(""); setNotice("This connection has ended, so the conversation is no longer available.");
          router.refresh();
        }
      });
    }, 15000);
    const channel = supabase.channel(`mingle-conversation-${activeId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` }, (payload) => {
        const row = payload.new as { id: string; sender_id: string; body: string; created_at: string; conversation_id: string };
        setMessages((current) => current.some((message) => message.id === row.id) ? current : [...current, { id: row.id, senderId: row.sender_id, body: row.body, createdAt: row.created_at }]);
        setItems((current) => current.map((item) => item.conversationId === activeId ? { ...item, lastMessage: row.body, lastMessageAt: row.created_at, unreadCount: 0 } : item));
        if (row.sender_id !== memberId) void markConversationReadAction(activeId);
      }).subscribe();
    return () => { cancelled = true; window.clearInterval(accessCheck); void supabase.removeChannel(channel); };
  }, [activeId, memberId, router]);

  function loadOlder() {
    const oldest = messages[0];
    if (!active || !oldest) return;
    startTransition(async () => {
      const result = await loadOlderConversationMessagesAction(active.conversationId, oldest.createdAt, oldest.id);
      if (result.ok) { setMessages((current) => [...result.messages, ...current]); setHasOlder(result.messages.length >= 60); }
      else setNotice("Older messages could not be loaded.");
    });
  }

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active || !draft.trim()) return;
    const body = draft.trim();
    setDraft(""); setNotice("");
    startTransition(async () => {
      const result = await sendMessageAction(active.conversationId, body);
      if (!result.ok) { setDraft(body); setNotice(result.error); return; }
      await refreshMessages(active.conversationId);
      setItems((current) => current.map((item) => item.conversationId === active.conversationId ? { ...item, lastMessage: body, lastMessageAt: new Date().toISOString() } : item));
      router.refresh();
    });
  }

  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Your conversations</p><p className="mt-1 text-sm text-muted">Private chats with people you’ve mutually connected with.</p></div><span className="rounded-full border border-line px-3 py-1.5 text-xs text-muted">{items.length} {items.length === 1 ? "connection" : "connections"}</span></div>
    <div className="grid min-h-[34rem] grid-cols-1 overflow-hidden rounded-card border border-line bg-surface shadow-card md:grid-cols-[18rem_minmax(0,1fr)]">
      <section className={`${activeId ? "hidden md:flex" : "flex"} min-h-[34rem] flex-col border-line md:border-r`} aria-label="Conversation list">
        <div className="border-b border-line p-4"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden /><input aria-label="Search conversations" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" className="h-11 w-full rounded-control border border-line bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted" /></div></div>
        <div className="flex-1">{visible.length ? <ul className="divide-y divide-line">{visible.map((item) => <li key={item.conversationId}><button type="button" onClick={() => { setActiveId(item.conversationId); setNotice(""); }} aria-current={activeId === item.conversationId ? "true" : undefined} className={`flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-foreground/5 ${activeId === item.conversationId ? "bg-foreground/5" : ""}`}><Avatar name={item.displayName} size={46} highlighted={item.unreadCount > 0} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold">{item.displayName}</span><span className="shrink-0 text-[11px] text-muted">{formatDay(item.lastMessageAt, locale, timezone)}</span></span><span className="mt-1 block truncate text-xs text-muted">{item.lastMessage ?? "You’re connected. Say hello."}</span></span>{item.unreadCount > 0 ? <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-on-brand">{item.unreadCount}</span> : <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />}</button></li>)}</ul> : <div className="p-7 text-center"><MessageCircle className="mx-auto size-6 text-muted" aria-hidden /><p className="mt-3 text-sm font-semibold">{items.length ? "No conversations found" : "No conversations yet"}</p><p className="mt-1 text-xs leading-5 text-muted">{items.length ? "Try another search." : "When you and another member connect mutually, your private conversation will appear here."}</p></div>}</div>
      </section>
      <section className={`${activeId ? "flex" : "hidden md:flex"} min-h-[34rem] min-w-0 flex-col`} aria-label="Conversation detail">
        {active ? <>
          <header className="flex items-center gap-3 border-b border-line px-4 py-3"><button type="button" onClick={() => setActiveId("")} className="rounded-full p-2 text-muted hover:bg-foreground/5 md:hidden" aria-label="Back to conversations"><ArrowLeft className="size-5" aria-hidden /></button><Avatar name={active.displayName} size={42} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{active.displayName}</p><p className="text-xs text-muted">{[active.city, active.country].filter(Boolean).join(" · ") || "MINGLE member"}</p></div><Link href={`/report?profile=${encodeURIComponent(active.otherMemberId)}`} className="rounded-full border border-line px-2.5 py-1.5 text-[10px] font-semibold text-muted hover:bg-foreground/5">Report</Link><span className="rounded-full border border-line px-2.5 py-1 text-[10px] text-muted">Connected</span></header>
          <div className="flex items-center justify-center gap-2 border-b border-line px-4 py-2 text-[11px] text-muted"><ShieldCheck className="size-3.5" aria-hidden /> Be respectful. Never share passwords or sensitive documents.</div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Messages">{messages.length ? <>{hasOlder ? <div className="text-center"><button type="button" onClick={loadOlder} disabled={busy} className="text-xs font-semibold text-muted underline">Load older messages</button></div> : null}{messages.map((message) => { const mine = message.senderId === memberId; return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-4 py-2.5 ${mine ? "rounded-br-md bg-brand text-on-brand" : "rounded-bl-md bg-foreground/5 text-foreground"}`}><p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p><p className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? "text-on-brand/75" : "text-muted"}`}>{formatTime(message.createdAt, locale, timezone)}{mine ? <Check className="size-3" aria-label="Sent" /> : null}</p></div></div>; })}</> : <div className="flex h-full min-h-48 flex-col items-center justify-center text-center"><MessageCircle className="size-7 text-muted" aria-hidden /><p className="mt-3 text-sm font-semibold">Start the conversation</p><p className="mt-1 text-xs text-muted">A thoughtful hello is a good place to begin.</p></div>}</div>
          <form onSubmit={send} className="border-t border-line p-3"><label htmlFor="message-draft" className="sr-only">Write a message</label><div className="flex items-end gap-2"><textarea id="message-draft" rows={1} maxLength={5000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message…" className="max-h-36 min-h-11 flex-1 resize-y rounded-control border border-line bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted" /><Button type="submit" size="md" disabled={!draft.trim() || busy} loading={busy} aria-label="Send message"><Send className="size-4" aria-hidden /><span className="hidden sm:inline">Send</span></Button></div><p className="mt-2 text-[10px] text-muted">Messages are private to this connection. Maximum 5,000 characters.</p></form>
        </> : <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center"><div className="flex size-16 items-center justify-center rounded-full border border-line"><MessageCircle className="size-7 text-muted" aria-hidden /></div><h2 className="mt-4 font-display text-xl font-semibold">Your messages, in one place.</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted">Select a mutual connection to open your private conversation.</p></div>}
      </section>
    </div>
    {notice ? <p role="status" className="text-xs leading-5 text-muted">{notice}</p> : null}
  </div>;
}
