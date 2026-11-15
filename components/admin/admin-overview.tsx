"use client";

import { useMemo, useState } from "react";
import { Activity, ClipboardList, FileSearch, Flag, Search, ShieldCheck, Users, UserCheck, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";

type AdminSection = { id: string; label: string; icon: LucideIcon; title: string; description: string; requirements: string[] };

const sections: [AdminSection, ...AdminSection[]] = [
  { id: "overview", label: "Overview", icon: Activity, title: "Workspace overview", description: "The admin interface structure is ready for protected service integration. No operational data is available in this frontend preview.", requirements: ["Authenticated administrator session", "Role and permission checks on every admin route and action", "Server-sourced operational metrics"] },
  { id: "members", label: "Members", icon: Users, title: "Member management", description: "Search, review and account-status workflows are represented here. Member records are not connected or fabricated.", requirements: ["Protected member directory and pagination", "Member detail endpoint with least-privilege fields", "Audited account status actions and confirmation"] },
  { id: "verification", label: "Verification", icon: UserCheck, title: "Under-18 report review", description: "Date-of-birth declarations are not age verification. No reports of suspected under-18 accounts are available in this preview.", requirements: ["Documented removal procedure for suspected under-18 accounts", "Restricted reviewer permissions", "Decision history and privacy-safe retention"] },
  { id: "moderation", label: "Moderation", icon: ShieldCheck, title: "Moderation workspace", description: "A moderation queue cannot be shown until reports and moderation cases are securely stored and permissioned.", requirements: ["Server-side moderation queue", "Case assignment and priority rules", "Evidence handling, audit trail and appeal process"] },
  { id: "reports", label: "Reports", icon: Flag, title: "Member reports", description: "No reports have been submitted to a service. The member-facing report form is currently a local preview only.", requirements: ["Secure report submission and case creation", "Reporter privacy and anti-abuse controls", "Resolution states and member notifications"] },
  { id: "audit", label: "Audit log", icon: ClipboardList, title: "Administrative audit history", description: "Administrative activity must be recorded by the server and must not be editable from this client interface.", requirements: ["Append-only server audit events", "Actor, timestamp, target and action metadata", "Restricted search and retention controls"] },
];

export function AdminOverview() {
  const [active, setActive] = useState("overview");
  const [search, setSearch] = useState("");
  const selected = sections.find((section) => section.id === active) ?? sections[0];
  const Icon = selected.icon;
  const filteredRequirements = useMemo(() => selected.requirements.filter((item) => item.toLowerCase().includes(search.toLowerCase())), [selected, search]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start gap-4"><ShieldCheck className="mt-1 size-6 shrink-0" aria-hidden /><div><h2 className="text-title font-semibold">Administration is not enabled</h2><p className="mt-2 text-sm leading-6 text-muted">This is a non-operational interface preview. It has no administrator authentication, member data, verification decisions, moderation queue or enforcement capability. Do not expose it as a production admin console.</p></div></div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => { const SectionIcon = section.icon; return <button key={section.id} type="button" onClick={() => { setActive(section.id); setSearch(""); }} aria-pressed={active === section.id} className={`rounded-card border p-4 text-left transition-colors ${active === section.id ? "border-foreground bg-foreground/5" : "border-line bg-surface hover:bg-foreground/5"}`}><span className="flex items-center gap-3"><SectionIcon className="size-5 shrink-0" aria-hidden /><span className="text-sm font-semibold">{section.label}</span></span><span className="mt-2 block text-xs leading-5 text-muted">{section.description}</span></button>; })}
      </div>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><Icon className="size-5" aria-hidden /><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Admin workspace / {selected.label}</p><h2 className="mt-1 text-title font-semibold">{selected.title}</h2></div></div><span className="rounded-full border border-line px-3 py-1 text-xs text-muted">Unavailable</span></div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">{selected.description}</p>
        <div className="mt-5 max-w-md"><Field label="Search requirements" placeholder="Filter this section" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <div className="mt-5"><h3 className="text-sm font-semibold">Required before activation</h3>{filteredRequirements.length ? <ul className="mt-3 space-y-3">{filteredRequirements.map((item) => <li key={item} className="flex items-start gap-3 text-sm text-muted"><span className="mt-1 size-2 shrink-0 rounded-full bg-brand" aria-hidden />{item}</li>)}</ul> : <p className="mt-3 text-sm text-muted">No matching requirements.</p>}</div>
        <p role="status" className="mt-6 rounded-control border border-line p-4 text-xs leading-5 text-muted"><FileSearch className="mr-2 inline size-4" aria-hidden />No live records are loaded. Search and navigation above operate only on this static interface checklist.</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2"><Card><h3 className="flex items-center gap-2 font-semibold"><Users className="size-4" aria-hidden />Member data</h3><p className="mt-2 text-sm leading-6 text-muted">No member names, email addresses, profile details or account statuses are exposed to this preview.</p></Card><Card><h3 className="flex items-center gap-2 font-semibold"><Search className="size-4" aria-hidden />Operational analytics</h3><p className="mt-2 text-sm leading-6 text-muted">No fabricated member counts, growth metrics, reports or moderation performance figures are displayed.</p></Card></div>
    </div>
  );
}
