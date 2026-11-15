"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark, Heart, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { blockMemberAction, likeMemberAction, passMemberAction, toggleSavedProfileAction } from "@/lib/discovery/actions";
import type { MemberCandidate, SavedMember } from "@/lib/discovery/server";

export function LiveDiscoveryExperience({ initialCandidates, initialSaved }: { initialCandidates: MemberCandidate[]; initialSaved: SavedMember[] }) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [saved, setSaved] = useState(initialSaved);
  const [notice, setNotice] = useState("");
  const [busy, startTransition] = useTransition();

  function removeCandidate(id: string) { setCandidates((items) => items.filter((item) => item.id !== id)); }
  function like(candidate: MemberCandidate) {
    startTransition(async () => {
      try {
        const result = await likeMemberAction(candidate.id);
        removeCandidate(candidate.id);
        setNotice(result.matched ? `It's a mutual connection with ${candidate.displayName}.` : `Your interest in ${candidate.displayName} has been sent.`);
      } catch (error) { setNotice(error instanceof Error ? error.message : "Your action could not be completed."); }
    });
  }
  function pass(candidate: MemberCandidate) {
    startTransition(async () => {
      try { await passMemberAction(candidate.id); removeCandidate(candidate.id); setNotice("Profile passed."); }
      catch (error) { setNotice(error instanceof Error ? error.message : "Profile could not be passed."); }
    });
  }
  function block(candidate: MemberCandidate) {
    startTransition(async () => {
      try { await blockMemberAction(candidate.id); removeCandidate(candidate.id); setSaved((items) => items.filter((item) => item.id !== candidate.id)); setNotice(`${candidate.displayName} has been blocked and removed from your connections.`); }
      catch (error) { setNotice(error instanceof Error ? error.message : "This profile could not be blocked."); }
    });
  }
  function save(candidate: MemberCandidate) {
    const isSaved = saved.some((item) => item.id === candidate.id);
    startTransition(async () => {
      try {
        await toggleSavedProfileAction(candidate.id, !isSaved);
        setSaved((items) => isSaved ? items.filter((item) => item.id !== candidate.id) : [...items, { id: candidate.id, displayName: candidate.displayName, age: candidate.age, city: candidate.city, country: candidate.country, bio: candidate.bio }]);
        setNotice(isSaved ? "Removed from saved profiles." : "Profile saved for later.");
      } catch (error) { setNotice(error instanceof Error ? error.message : "Saved profiles could not be updated."); }
    });
  }

  return <div className="space-y-6">
    <section className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Discover intentionally</p><h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">People worth getting to know.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted">Real member profiles are shown only when both people meet each other’s age and gender preferences. Compatibility is an exploratory guide, not a prediction.</p></div>
      <p className="rounded-full border border-line px-4 py-2 text-sm text-muted">{candidates.length} profiles</p>
    </section>
    {notice ? <p role="status" className="rounded-control border border-line bg-surface p-3 text-sm">{notice}</p> : null}
    {candidates.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{candidates.map((candidate) => <article key={candidate.id} className="overflow-hidden rounded-card border border-line bg-surface">
      <div className="relative flex min-h-64 items-center justify-center bg-surface-raised">
        {candidate.photos[0] ? <img src={candidate.photos[0].url} alt={`${candidate.displayName}'s profile`} className="absolute inset-0 size-full object-cover" /> : <span className="font-display text-6xl text-muted">{candidate.displayName.slice(0, 1)}</span>}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white">Adult eligibility checked</span>
      </div>
      <div className="space-y-3 p-5"><div><p className="font-display text-2xl font-semibold">{candidate.displayName}, {candidate.age}</p><p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><MapPin className="size-4" aria-hidden />{candidate.city}, {candidate.country}</p></div>
        <p className="text-sm leading-6 text-muted">{candidate.bio}</p><p className="text-xs font-semibold text-brand">{candidate.intention.replaceAll("_", " ")}</p>
        <div className="flex flex-wrap gap-2">{candidate.sharedInterests.slice(0, 5).map((interest) => <span key={interest} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">{interest}</span>)}</div><p className="text-xs text-muted">{candidate.sharedInterests.length} shared interests · {candidate.sharedAnswers} aligned questionnaire answers{candidate.alignedIntention ? " · Same relationship intention" : ""}</p>
        <div className="flex flex-wrap gap-2 border-t border-line pt-4"><Button variant="secondary" className="flex-1" disabled={busy} onClick={() => pass(candidate)}><X className="size-4" aria-hidden />Pass</Button><Button variant="secondary" disabled={busy} onClick={() => save(candidate)} aria-label="Save profile"><Bookmark className="size-4" aria-hidden /></Button><Button className="flex-1" disabled={busy} onClick={() => like(candidate)}><Heart className="size-4" aria-hidden />Like</Button><Button variant="ghost" size="sm" disabled={busy} onClick={() => block(candidate)}>Block</Button></div>
        <Link href={`/report?profile=${encodeURIComponent(candidate.id)}`} className="inline-block text-caption font-semibold underline underline-offset-4">Report this member</Link>
      </div></article>)}</div> : <section className="rounded-card border border-line bg-surface p-8 text-center"><h3 className="font-display text-2xl font-semibold">You’re all caught up.</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">There are no new eligible profiles to show right now. New suggestions appear as eligible members join or update their preferences.</p></section>}
    <aside className="rounded-card border border-line bg-surface p-5"><h3 className="font-semibold">Saved profiles</h3>{saved.length ? <ul className="mt-3 grid gap-2 sm:grid-cols-2">{saved.map((item) => <li key={item.id} className="rounded-control border border-line p-3 text-sm"><span className="font-semibold">{item.displayName}, {item.age}</span><span className="ml-2 text-muted">{item.city}</span></li>)}</ul> : <p className="mt-2 text-sm text-muted">Save a profile to revisit it here.</p>}</aside>
  </div>;
}
