/**
 * The single rule for "may this account use member features?" (brief §7, §15).
 * Pure and fail-closed: anything not explicitly satisfied is denied. Enforce this on the
 * server and in the database, never only by hiding UI.
 *
 * Age model (decision of 14 November 2026): Mingle does NOT run a paid third-party age check.
 * The age layer is the declared date of birth (18+ floor, per-market minimum) enforced by the
 * database, plus reporting and moderation. A declared date is not proof of age, and nothing in
 * the product may say members are "age-verified".
 */
export type AccountStatus = "pending" | "active" | "suspended" | "blocked_underage" | "deleted";

export type AccessSubject = {
  emailVerified: boolean;
  status: AccountStatus;
};

export type DenyReason = "signed_out" | "email_unverified" | "account_blocked" | "eligibility_pending";

export type AccessDecision =
  | { allowed: true }
  /** Blocked destinations go to /sign-in: the caller must also end the session. */
  | { allowed: false; reason: DenyReason; destination: "/sign-in" | "/eligibility" };

export function decideMemberAccess(subject: AccessSubject | null): AccessDecision {
  if (!subject) return { allowed: false, reason: "signed_out", destination: "/sign-in" };

  if (
    subject.status === "blocked_underage" ||
    subject.status === "suspended" ||
    subject.status === "deleted"
  ) {
    return { allowed: false, reason: "account_blocked", destination: "/sign-in" };
  }
  if (!subject.emailVerified) {
    return { allowed: false, reason: "email_unverified", destination: "/eligibility" };
  }
  if (subject.status === "pending") {
    return { allowed: false, reason: "eligibility_pending", destination: "/eligibility" };
  }
  if (subject.status !== "active") {
    return { allowed: false, reason: "account_blocked", destination: "/sign-in" };
  }
  return { allowed: true };
}
