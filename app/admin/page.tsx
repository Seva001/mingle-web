import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminConsole } from "@/components/admin/admin-console";
import { getAdminWorkspace } from "@/lib/admin/server";

export const metadata: Metadata = { title: "Admin workspace", robots: { index: false, follow: false } };

export default async function Page() {
  const workspace = await getAdminWorkspace();
  if (!workspace.configured) return notFound();
  if (!workspace.authorized) {
    if ("unavailable" in workspace && workspace.unavailable) {
      return <main className="mx-auto min-h-dvh max-w-3xl px-5 py-16"><h1 className="font-display text-headline">Admin workspace unavailable</h1><p className="mt-3 text-sm leading-6 text-muted">The moderation service could not be reached. Access is denied until the authorization and queue checks succeed.</p></main>;
    }
    return notFound();
  }
  return <main className="mx-auto min-h-dvh w-full max-w-6xl px-5 py-12 sm:px-8"><div className="mb-8"><p className="text-caption font-semibold text-muted">MINGLE / RESTRICTED STAFF AREA</p><h1 className="mt-2 font-display text-headline">Safety & moderation</h1></div><AdminConsole reports={workspace.reports} photos={workspace.photos} audit={workspace.audit} isAdmin={workspace.isAdmin} /></main>;
}
