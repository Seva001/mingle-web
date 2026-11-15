import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  new URL("../supabase/migrations/20261114000007_remove_age_assurance_requirement.sql", import.meta.url),
  "utf8",
);
const code = sql.replace(/--.*$/gm, "");

describe("migration 7: declared-age model (no paid provider)", () => {
  it("drops the provider requirement on active accounts", () => {
    expect(code).toContain("drop constraint if exists accounts_active_requires_age_assurance");
  });
  it("no longer reads the provider outcome in any rewritten function", () => {
    expect(/age_assurance_outcome\s*(=|<>)/.test(code)).toBe(false);
  });
  it("still refuses activation without a date of birth that meets the market minimum", () => {
    expect(code).toContain("market_age_satisfied");
    expect(code).toContain("account_birth_dates");
    expect(code).toContain("not coalesce(market_age_satisfied, false)");
  });
  it("still never auto-clears blocked statuses", () => {
    expect(code).toContain("in ('suspended', 'blocked_underage', 'deleted')");
  });
  it("evaluates eligibility as soon as the auth user is created", () => {
    expect(code).toContain("create trigger on_auth_user_created_eligibility");
    expect(code).toContain("after insert on auth.users");
  });
  it("keeps the market's enabled flag as a gate", () => {
    expect(code).toContain("not coalesce(market_is_enabled, false)");
  });
});
