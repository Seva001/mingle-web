import type { Metadata } from "next";
import { SettingsPreferences } from "@/components/member/settings-preferences";
import { MarketSettings } from "@/components/member/market-settings";
import { getMyMarketSettings } from "@/lib/markets/server";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const marketSettings = await getMyMarketSettings();
  return <div className="flex flex-col gap-6"><h1 className="font-display text-headline">Settings</h1>{marketSettings ? <MarketSettings settings={marketSettings} /> : null}<SettingsPreferences /></div>;
}
