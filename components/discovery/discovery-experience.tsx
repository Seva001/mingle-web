import { Compass, HeartHandshake, SlidersHorizontal } from "lucide-react";

export function DiscoveryExperience() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Discover intentionally</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">People worth getting to know.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Explore meaningful connections shaped around shared interests, values and relationship intentions.</p>
        </div>
      </section>
      <section className="rounded-card border border-line bg-surface px-6 py-12 text-center md:px-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand"><Compass className="size-7" aria-hidden /></div>
        <h3 className="mt-5 font-display text-2xl font-semibold">Your discovery starts here.</h3>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">As the Mingle community comes together, your recommendations will appear here — guided by mutual preferences and the things that matter to you.</p>
        <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
          <div className="rounded-control border border-line p-4"><HeartHandshake className="size-5 text-brand" aria-hidden /><h4 className="mt-3 text-sm font-semibold">Mutual compatibility</h4><p className="mt-1 text-xs leading-5 text-muted">Suggestions are designed around preferences that work both ways.</p></div>
          <div className="rounded-control border border-line p-4"><SlidersHorizontal className="size-5 text-brand" aria-hidden /><h4 className="mt-3 text-sm font-semibold">Your preferences</h4><p className="mt-1 text-xs leading-5 text-muted">Your profile and preferences help shape who you discover.</p></div>
        </div>
      </section>
    </div>
  );
}
