import { MessageCircle, ShieldCheck } from "lucide-react";

export function ChatsView() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Your conversations</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">A space for meaningful conversations.</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Your conversations with people you connect with will appear here.</p>
      </header>
      <section className="flex min-h-[28rem] flex-col items-center justify-center rounded-card border border-line bg-surface px-6 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand"><MessageCircle className="size-7" aria-hidden /></div>
        <h2 className="mt-5 font-display text-2xl font-semibold">Your inbox is ready.</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted">When you and another member show mutual interest, your connection can become a conversation here.</p>
        <div className="mt-6 flex items-center gap-2 text-xs text-muted"><ShieldCheck className="size-4" aria-hidden />Conversations are designed for connected members.</div>
      </section>
    </div>
  );
}
