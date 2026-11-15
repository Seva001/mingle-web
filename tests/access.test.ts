import { describe, expect, it } from "vitest";
import { decideMemberAccess, type AccessSubject } from "@/lib/auth/access";

const good: AccessSubject = { emailVerified: true, status: "active" };
const deny = (s: AccessSubject | null) => decideMemberAccess(s);

describe("decideMemberAccess is fail-closed (brief §7, §15)", () => {
  it("allows only a confirmed, active account", () => {
    expect(deny(good)).toEqual({ allowed: true });
  });
  it("sends signed-out visitors to sign in", () => {
    expect(deny(null)).toEqual({ allowed: false, reason: "signed_out", destination: "/sign-in" });
  });
  it("does not admit an account whose email is unconfirmed", () => {
    expect(deny({ ...good, emailVerified: false })).toMatchObject({
      allowed: false,
      reason: "email_unverified",
      destination: "/eligibility",
    });
  });
  it.each(["blocked_underage", "suspended", "deleted"] as const)(
    "ends the session for status = %s",
    (status) => {
      expect(deny({ ...good, status })).toEqual({
        allowed: false,
        reason: "account_blocked",
        destination: "/sign-in",
      });
    },
  );
  it("routes a pending account (market closed or declared age below the minimum) to eligibility", () => {
    expect(deny({ ...good, status: "pending" })).toEqual({
      allowed: false,
      reason: "eligibility_pending",
      destination: "/eligibility",
    });
  });
  it("has no age-assurance input: access depends only on email and account status", () => {
    expect(Object.keys(good).sort()).toEqual(["emailVerified", "status"]);
  });
});
