import { Bell } from "lucide-react";

export function NotificationsView() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Notifications</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Stay in the loop.</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Important updates about your profile, connections and conversations will appear here.</p>
      </header>
      <section className="flex min-h-[24rem] flex-col items-center justify-center rounded-card border border-line bg-surface px-6 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand"><Bell className="size-7" aria-hidden /></div>
        <h2 className="mt-5 font-display text-2xl font-semibold">You’re all caught up.</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted">When there’s something important to share, you’ll find it here.</p>
      </section>
    </div>
  );
}
