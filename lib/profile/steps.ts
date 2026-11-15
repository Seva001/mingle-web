import type { SectionId } from "@/lib/profile/completion";

/** Onboarding order (brief §11). The same screens are reused for editing via ?step=<id>. */
export const STEP_ORDER: readonly SectionId[] = [
  "basics",
  "photos",
  "intentions",
  "questionnaire",
  "preferences",
];

export function parseStep(value: string | undefined): SectionId {
  return STEP_ORDER.find((s) => s === value) ?? "basics";
}
