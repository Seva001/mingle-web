import type { Profile } from "@/lib/profile/types";

export type DiscoveryCandidate = Omit<Profile, "age"> & {
  age: number;
  id: string;
  /** Explicitly synthetic fixture data. Never represents a real member. */
  demoLabel: "synthetic_fixture";
  /** Optional display-only accent for the fixture portrait placeholder. */
  accent: "violet" | "rose" | "amber" | "blue" | "green";
};

export type DiscoveryAction = "liked" | "passed" | "saved" | "blocked";
export type DiscoveryActions = Record<string, DiscoveryAction>;

export type CompatibilityResult = {
  score: number;
  sharedInterests: string[];
  sharedAnswers: number;
  alignedIntention: boolean;
  explanation: string[];
};
