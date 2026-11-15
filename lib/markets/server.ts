import "server-only";
import { createClient } from "@/lib/supabase/server";

export type EnabledMarket = {
  code: string;
  displayName: string;
  minimumAge: number;
  defaultLocale: string;
  supportedLocales: string[];
  defaultTimezone: string;
  termsVersion: string;
  privacyVersion: string;
};

type MarketRow = Record<string, unknown>;

export async function getEnabledMarkets(): Promise<EnabledMarket[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_enabled_markets");
    if (error || !Array.isArray(data)) return [];
    return (data as MarketRow[]).flatMap((row) => {
      if (typeof row.code !== "string" || !/^[A-Z]{2}$/.test(row.code)
        || typeof row.display_name !== "string" || typeof row.minimum_age !== "number"
        || typeof row.default_locale !== "string" || typeof row.default_timezone !== "string"
        || !Array.isArray(row.supported_locales)) return [];
      return [{
        code: row.code,
        displayName: row.display_name,
        minimumAge: row.minimum_age,
        defaultLocale: row.default_locale,
        supportedLocales: row.supported_locales.filter((value): value is string => typeof value === "string"),
        defaultTimezone: row.default_timezone,
        termsVersion: typeof row.terms_version === "string" ? row.terms_version : "",
        privacyVersion: typeof row.privacy_version === "string" ? row.privacy_version : "",
      }];
    });
  } catch {
    return [];
  }
}

export type MyMarketSettings = {
  marketCode: string;
  marketName: string;
  locale: string;
  timezone: string;
  supportedLocales: string[];
};

export async function getMyMarketSettings(): Promise<MyMarketSettings | null> {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return null;
    const { data, error } = await supabase.rpc("get_my_market_settings");
    if (error || !data || typeof data !== "object") return null;
    const row = data as Record<string, unknown>;
    if (typeof row.market_code !== "string" || typeof row.market_name !== "string"
      || typeof row.locale !== "string" || typeof row.timezone !== "string"
      || !Array.isArray(row.supported_locales)) return null;
    return {
      marketCode: row.market_code,
      marketName: row.market_name,
      locale: row.locale,
      timezone: row.timezone,
      supportedLocales: row.supported_locales.filter((value): value is string => typeof value === "string"),
    };
  } catch {
    return null;
  }
}
