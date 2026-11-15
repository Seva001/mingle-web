/**
 * Initial recommendation signal weights — brief §6.
 * These are HYPOTHESES to be tested, not validated science. They must never be
 * shown to members as a prediction or guarantee of relationship success.
 */
export const COMPATIBILITY_WEIGHTS = {
  relationshipIntentions: 0.25,
  coreValues: 0.25,
  lifestyle: 0.2,
  interests: 0.15,
  communicationPreferences: 0.15,
} as const;

export type CompatibilitySignal = keyof typeof COMPATIBILITY_WEIGHTS;
