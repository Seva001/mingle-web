"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Check, Clock3, Flag, Image as ImageIcon, ShieldCheck, UserRoundX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/textarea";
import { reviewProfilePhoto, suspendMember, updateSafetyReport } from "@/lib/admin/actions";

type ReportRecord = {
  id: string; category: string; details: string; status: string; priority: string;
  created_at: string; target_account_id: string | null; target_display_name: string | null;
};
type PendingPhoto = { id: string; display_name: string | null; storage_path: string; created_at: string; signed_url?: string };
type AuditRecord = { id: number; actor_account_id: string | null; action: string; target_type: string; target_id: string; metadata: Record<string, unknown>; created_at: string };

function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function AdminConsole({ reports, photos, audit, isAdmin }: {
  reports: ReportRecord[]; photos: PendingPhoto[]; audit: AuditRecord[]; isAdmin: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [resolution, setResolution] = useState<Record<string, string>>({});
  const [suspensionReason, setSuspensionReason] = useState<Record<string, string>>({});

  function runAction(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      setFeedback(result.message);
    });
  }

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex items-start gap-3"><ShieldCheck className="mt-1 size-6 shrink-0" aria-hidden /><div><h2 className="text-title font-semibold">Protected moderation workspace</h2><p className="mt-1 text-sm leading-6 text-muted">Actions are authorized again inside database functions. Every moderation decision is recorded in the audit history. Only assigned staff should access member reports and private photos.</p></div></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-control bg-surface-raised p-4"><p className="text-caption text-muted">Open reports</p><p className="mt-1 text-2xl font-semibold tabular-nums">{reports.length}</p></div><div className="rounded-control bg-surface-raised p-4"><p className="text-caption text-muted">Photos awaiting review</p><p className="mt-1 text-2xl font-semibold tabular-nums">{photos.length}</p></div><div className="rounded-control bg-surface-raised p-4"><p className="text-caption text-muted">Audit events visible</p><p className="mt-1 text-2xl font-semibold tabular-nums">{audit.length}</p></div></div>
      </Card>

      <section aria-labelledby="reports-heading" className="space-y-4">
        <div className="flex items-center gap-3"><Flag className="size-5" aria-hidden /><div><h2 id="reports-heading" className="text-title font-semibold">Member reports</h2><p className="text-sm text-muted">Reporter identity is restricted to staff; do not share case details outside the review team.</p></div></div>
        {reports.length ? reports.map((report) => <Card key={report.id}>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted">{report.category.replaceAll("_", " ")}</p><h3 className="mt-1 font-semibold">{report.target_display_name || "Member reference unavailable"}</h3><p className="mt-1 text-xs text-muted">{dateLabel(report.created_at)} · Report {report.id.slice(0, 8)}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${report.priority === "high" || report.priority === "urgent" ? "bg-danger/10 text-danger" : "bg-surface-raised text-muted"}`}>{report.priority} priority</span></div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{report.details}</p>
          <div className="mt-4"><TextareaField label="Internal resolution note" value={resolution[report.id] ?? ""} onChange={(event) => setResolution((current) => ({ ...current, [report.id]: event.target.value }))} maxLength={1000} hint="Keep notes factual and relevant. Do not include sensitive information that is not needed." /></div>
          <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="secondary" disabled={pending} onClick={() => runAction(() => updateSafetyReport({ reportId: report.id, status: "under_review" }))}><Clock3 className="size-4" aria-hidden />Take case</Button><Button size="sm" disabled={pending} onClick={() => runAction(() => updateSafetyReport({ reportId: report.id, status: "resolved", resolution: resolution[report.id] }))}><Check className="size-4" aria-hidden />Resolve</Button><Button size="sm" variant="secondary" disabled={pending} onClick={() => runAction(() => updateSafetyReport({ reportId: report.id, status: "dismissed", resolution: resolution[report.id] }))}>Dismiss</Button></div>
          {isAdmin && report.target_account_id ? <div className="mt-5 border-t border-line pt-4"><TextareaField label="Suspension reason (admin only)" value={suspensionReason[report.id] ?? ""} onChange={(event) => setSuspensionReason((current) => ({ ...current, [report.id]: event.target.value }))} maxLength={500} hint="At least 10 characters. Explain the policy basis, not personal opinion." /><Button className="mt-3" size="sm" variant="danger" disabled={pending || (suspensionReason[report.id] ?? "").trim().length < 10} onClick={() => runAction(() => suspendMember({ accountId: report.target_account_id!, reason: suspensionReason[report.id] ?? "" }))}><UserRoundX className="size-4" aria-hidden />Suspend reported account</Button></div> : null}
        </Card>) : <Card><p className="text-sm text-muted">No open reports in the current moderation queue.</p></Card>}
      </section>

      <section aria-labelledby="photos-heading" className="space-y-4">
        <div className="flex items-center gap-3"><ImageIcon className="size-5" aria-hidden /><div><h2 id="photos-heading" className="text-title font-semibold">Photo moderation</h2><p className="text-sm text-muted">Only approved photos can appear in discovery. Review images for policy compliance before approval.</p></div></div>
        {photos.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{photos.map((photo) => <Card key={photo.id}>
          {photo.signed_url ? <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.signed_url} alt={`Profile photo submitted by ${photo.display_name || "a member"}`} className="aspect-[4/5] w-full rounded-control object-cover" />
          </> : <div className="flex aspect-[4/5] items-center justify-center rounded-control bg-surface-raised text-sm text-muted">Private image unavailable</div>}
          <h3 className="mt-3 font-semibold">{photo.display_name || "Member"}</h3><p className="mt-1 text-xs text-muted">Submitted {dateLabel(photo.created_at)}</p>
          <div className="mt-4 flex gap-2"><Button size="sm" disabled={pending || !photo.signed_url} onClick={() => runAction(() => reviewProfilePhoto({ photoId: photo.id, decision: "approved" }))}><Check className="size-4" aria-hidden />Approve</Button><Button size="sm" variant="danger" disabled={pending} onClick={() => runAction(() => reviewProfilePhoto({ photoId: photo.id, decision: "rejected" }))}>Reject</Button></div>
        </Card>)}</div> : <Card><p className="text-sm text-muted">No photos are waiting for moderation.</p></Card>}
      </section>

      {isAdmin ? <section aria-labelledby="audit-heading" className="space-y-4"><div><h2 id="audit-heading" className="text-title font-semibold">Administrative audit history</h2><p className="text-sm text-muted">Append-only event records from staff actions.</p></div><Card>{audit.length ? <div className="divide-y divide-line">{audit.map((event) => <div key={event.id} className="py-3 first:pt-0 last:pb-0"><p className="text-sm font-semibold">{event.action.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-muted">{event.target_type} · {event.target_id.slice(0, 12)} · {dateLabel(event.created_at)}</p></div>)}</div> : <p className="text-sm text-muted">No administrative events recorded yet.</p>}</Card></section> : null}
      <p className="text-xs text-muted" role="status" aria-live="polite">{feedback || (pending ? "Saving moderation decision…" : "Moderation actions require server-side authorization.")}</p>
      <p className="flex items-start gap-2 text-xs leading-5 text-muted"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />This workspace does not replace an emergency response process, legal review, or a formal appeals workflow. Never promise a report outcome to a member before review.</p>
    </div>
  );
}
