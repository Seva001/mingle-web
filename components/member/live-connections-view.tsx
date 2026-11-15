"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MessageCircle, ShieldBan, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { blockMemberAction } from "@/lib/discovery/actions";
import { unmatchMemberAction } from "@/lib/messaging/actions";
import type { MemberConnection } from "@/lib/discovery/server";
import { formatMarketDate } from "@/lib/i18n/format";

export function LiveConnectionsView({ connections: initialConnections, locale, timezone }: { connections: MemberConnection[]; locale: string; timezone: string }) {
  const [connections, setConnections] = useState(initialConnections);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();

  function block(person: MemberConnection) {
    startTransition(async () => {
      try {
        await blockMemberAction(person.id);
        setConnections((items) => items.filter((item) => item.id !== person.id));
        setNotice(`${person.displayName} has been blocked and disconnected.`);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "This member could not be blocked.");
      }
    });
  }

  function unmatch(person: MemberConnection) {
    startTransition(async () => {
      const result = await unmatchMemberAction(person.id);
      if (result.ok) {
        setConnections((items) => items.filter((item) => item.id !== person.id));
        setNotice(`${person.displayName} has been disconnected. Your previous chat is no longer accessible.`);
      } else setNotice(result.error);
    });
  }

  return <div className="space-y-6"><Card><div className="flex items-start gap-4"><div className="rounded-full border border-line p-3"><Users className="size-5" aria-hidden /></div><div><h2 className="text-title font-semibold">Your connections</h2><p className="mt-1 text-sm leading-6 text-muted">Connections are created only after both members have expressed interest. You can block or report a member at any time.</p></div></div></Card>
    {notice ? <p role="status" className="rounded-control border border-line bg-surface p-3 text-sm">{notice}</p> : null}
    {connections.length ? <ul className="grid gap-3 sm:grid-cols-2">{connections.map((person) => <li key={person.connectionId}><Card><p className="font-display text-xl font-semibold">{person.displayName}, {person.age}</p><p className="mt-1 text-sm text-muted">{person.city}, {person.country}</p><p className="mt-3 text-sm leading-6 text-muted">{person.bio}</p><p className="mt-3 text-xs text-muted">Connected {formatMarketDate(person.connectedAt, locale, timezone)}</p><div className="mt-4 flex flex-wrap items-center gap-3"><Link href="/chats" className="inline-flex items-center gap-2 text-sm font-semibold underline"><MessageCircle className="size-4" aria-hidden />Open chats</Link><Link href={`/report?profile=${encodeURIComponent(person.id)}`} className="text-sm font-semibold underline">Report</Link><Button size="sm" variant="ghost" disabled={pending} onClick={() => unmatch(person)}>Unmatch</Button><Button size="sm" variant="ghost" disabled={pending} onClick={() => block(person)}><ShieldBan className="size-4" aria-hidden />Block</Button></div></Card></li>)}</ul> : <Card><p className="text-sm text-muted">No mutual connections yet. When someone you like likes you back, you’ll see the connection here.</p><ButtonLink href="/discover" variant="secondary" className="mt-4">Explore discovery</ButtonLink></Card>}
  </div>;
}
