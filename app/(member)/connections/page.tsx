import type { Metadata } from "next";
import { ConnectionsView } from "@/components/member/connections-view";
import { LiveConnectionsView } from "@/components/member/live-connections-view";
import { getMyConnections } from "@/lib/discovery/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getMyMarketSettings } from "@/lib/markets/server";

export const metadata: Metadata = { title: "Connections" };

export default async function Page() {
  if (!isSupabaseConfigured()) return <div className="flex flex-col gap-8"><h1 className="font-display text-headline">Connections</h1><ConnectionsView /></div>;
  const [connections, marketSettings] = await Promise.all([getMyConnections(), getMyMarketSettings()]);
  return <div className="flex flex-col gap-8"><h1 className="font-display text-headline">Connections</h1><LiveConnectionsView connections={connections} locale={marketSettings?.locale ?? "en"} timezone={marketSettings?.timezone ?? "UTC"} /></div>;
}
