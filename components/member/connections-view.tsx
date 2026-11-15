import { HeartHandshake, ShieldCheck } from "lucide-react";

export function ConnectionsView() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Your connections</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Where mutual interest begins.</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Your connections bring together people who have both chosen to get to know one another.</p>
      </header>
      <section className="flex min-h-[24rem] flex-col items-center justify-center rounded-card border border-line bg-surface px-6 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand"><HeartHandshake className="size-7" aria-hidden /></div>
        <h2 className="mt-5 font-display text-2xl font-semibold">Your connections will appear here.</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted">A connection is formed when interest is mutual. From there, you can get to know each other through conversation.</p>
        <div className="mt-6 flex items-center gap-2 text-xs text-muted"><ShieldCheck className="size-4" aria-hidden />Only mutual connections can start a conversation.</div>
      </section>
    </div>
  );
}
