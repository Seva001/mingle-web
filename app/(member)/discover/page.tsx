import type { Metadata } from "next";
import { DiscoveryExperience } from "@/components/discovery/discovery-experience";
import { LiveDiscoveryExperience } from "@/components/discovery/live-discovery-experience";
import { getDiscoveryCandidates, getMySavedProfiles } from "@/lib/discovery/server";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Discover" };

export default async function Page() {
  if (!isSupabaseConfigured()) {
    return <div className="flex flex-col gap-7"><header><h1 className="font-display text-headline">Discover</h1><p className="mt-2 text-sm text-muted">Explore compatibility through shared intentions, interests and preferences.</p></header><DiscoveryExperience /></div>;
  }
  const [candidates, saved] = await Promise.all([getDiscoveryCandidates(), getMySavedProfiles()]);
  return <div className="flex flex-col gap-7"><header><h1 className="font-display text-headline">Discover</h1><p className="mt-2 text-sm text-muted">Explore compatibility through shared intentions, interests and preferences.</p></header><LiveDiscoveryExperience initialCandidates={candidates} initialSaved={saved} /></div>;
}
