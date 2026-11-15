/**
 * Adult eligibility: the declared-date-of-birth check (brief §6, §7).
 *
 * This is a declaration, not verification. There is no paid third-party age check (decision of
 * 14 November 2026). The safeguards around it are the database 18+ trigger, the per-market minimum
 * age, in-product reporting, and removal of accounts that are found to be under 18.
 *
 * 18 is the brief's floor. The age of majority is higher in some countries; per-country
 * minimums belong to the country-by-country legal review (brief §7), not to this constant.
 */
export const MINIMUM_AGE = 18;
const MAXIMUM_PLAUSIBLE_AGE = 120;

export type DateParts = { year: number; month: number; day: number };

/** Strict `YYYY-MM-DD` (what `<input type="date">` submits). Rejects impossible dates. */
export function parseIsoDate(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

/** Whole years elapsed. A 29 Feb birthday counts as passed on 1 Mar (the stricter reading). */
export function ageOn(birth: DateParts, today: DateParts): number {
  let age = today.year - birth.year;
  if (today.month < birth.month || (today.month === birth.month && today.day < birth.day)) {
    age -= 1;
  }
  return age;
}

export type DeclaredAgeResult =
  | { ok: true; age: number }
  | { ok: false; reason: "invalid" | "future" | "implausible" | "underage" };

/** Uses UTC for "today". Near midnight this can only be stricter, never looser, for the west. */
export function checkDeclaredAge(value: string, now: Date = new Date()): DeclaredAgeResult {
  const birth = parseIsoDate(value);
  if (!birth) return { ok: false, reason: "invalid" };

  const today: DateParts = {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    day: now.getUTCDate(),
  };
  const age = ageOn(birth, today);

  if (age < 0) return { ok: false, reason: "future" };
  if (age > MAXIMUM_PLAUSIBLE_AGE) return { ok: false, reason: "implausible" };
  if (age < MINIMUM_AGE) return { ok: false, reason: "underage" };
  return { ok: true, age };
}

/** Country/market policy may raise the adult threshold above the platform floor. */
export function checkDeclaredAgeForMinimum(
  value: string,
  minimumAge: number,
  now: Date = new Date(),
): DeclaredAgeResult {
  if (!Number.isInteger(minimumAge) || minimumAge < MINIMUM_AGE || minimumAge > 99) {
    return { ok: false, reason: "invalid" };
  }
  const birth = parseIsoDate(value);
  if (!birth) return { ok: false, reason: "invalid" };
  const today: DateParts = {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    day: now.getUTCDate(),
  };
  const age = ageOn(birth, today);
  if (age < 0) return { ok: false, reason: "future" };
  if (age > MAXIMUM_PLAUSIBLE_AGE) return { ok: false, reason: "implausible" };
  if (age < minimumAge) return { ok: false, reason: "underage" };
  return { ok: true, age };
}
