import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkDeclaredAgeForMinimum } from "@/lib/auth/eligibility";
import { formatMarketDate, formatMarketDateTime } from "@/lib/i18n/format";

const migration = readFileSync("supabase/migrations/20261110000005_international_readiness.sql", "utf8");
const signupAction = readFileSync("lib/auth/actions.ts", "utf8");
const signupForm = readFileSync("components/forms/sign-up-form.tsx", "utf8");
const marketServer = readFileSync("lib/markets/server.ts", "utf8");

const NOW = new Date("2026-11-13T12:00:00Z");

describe("market-specific age requirements", () => {
  it("supports higher country thresholds without changing the platform floor", () => {
    expect(checkDeclaredAgeForMinimum("2005-11-13", 21, NOW)).toEqual({ ok: true, age: 21 });
    expect(checkDeclaredAgeForMinimum("2006-11-13", 21, NOW)).toEqual({ ok: false, reason: "underage" });
  });
  it("rejects invalid thresholds", () => {
    expect(checkDeclaredAgeForMinimum("1990-01-01", 17, NOW)).toEqual({ ok: false, reason: "invalid" });
    expect(checkDeclaredAgeForMinimum("1990-01-01", 100, NOW)).toEqual({ ok: false, reason: "invalid" });
  });
});

describe("market locale formatting", () => {
  it("formats a timestamp in the selected timezone", () => {
    expect(formatMarketDateTime("2026-11-13T12:00:00Z", "en-GB", "Africa/Lagos")).toContain("13 Nov 2026");
  });
  it("falls back safely for invalid values and timezones", () => {
    expect(formatMarketDate("not-a-date", "en", "UTC")).toBe("—");
    expect(formatMarketDate("2026-11-13T12:00:00Z", "en", "Not/A_Timezone")).toContain("2026");
  });
});

describe("international readiness source contracts", () => {
  it("keeps every market disabled until explicitly configured", () => {
    expect(migration).toContain("No country is enabled by this migration");
    expect(migration).toContain("where m.enabled = true");
    expect(migration).toContain("p_enabled boolean");
    expect(migration).toContain("coalesce(p_enabled, false)");
  });
  it("requires an enabled launch market and records policy consent during signup", () => {
    expect(migration).toContain("this market is not currently accepting registrations");
    expect(migration).toContain("terms_accepted");
    expect(migration).toContain("privacy_accepted");
    expect(migration).toContain("market_consent_records");
    expect(signupAction).toContain("getEnabledMarkets");
    expect(signupForm).toContain('name="marketCode"');
    expect(marketServer).toContain('rpc("get_enabled_markets")');
  });
  it("uses the market allowlist and opt-in rule for cross-market discovery", () => {
    expect(migration).toContain("candidate_market.allow_cross_market and my_market.allow_cross_market");
    expect(migration).toContain("public.admin_configure_market");
  });
  it("validates locale and timezone in the database rather than trusting browser values", () => {
    expect(migration).toContain("public.update_my_locale_settings");
    expect(migration).toContain("pg_catalog.pg_timezone_names");
    expect(migration).toContain("p_locale = any(supported)");
  });
});
