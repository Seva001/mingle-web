import { describe, expect, it } from "vitest";
import { DISCOVERY_FIXTURES } from "@/lib/discovery/fixtures";
import { calculateCompatibility, getRecommendations, isEligibleCandidate } from "@/lib/discovery/engine";
import { emptyProfile } from "@/lib/profile/types";
import type { Profile } from "@/lib/profile/types";

function completeMember(overrides: Partial<Profile> = {}): Profile {
  return {
    ...emptyProfile(),
    displayName: "Demo Member",
    age: 29,
    gender: "man",
    city: "Lagos",
    country: "Nigeria",
    intention: "long_term",
    interests: ["Travel", "Music", "Reading"],
    answers: { v_family: "very", v_ambition: "balanced", l_weekend: "explore", c_contact: "few" },
    interestedIn: ["woman", "non_binary"],
    ageMin: 24,
    ageMax: 36,
    ...overrides,
  };
}

describe("discovery eligibility", () => {
  it("only returns synthetic profiles that satisfy mutual age and gender preferences", () => {
    const member = completeMember();
    const results = getRecommendations(member, DISCOVERY_FIXTURES);
    expect(results.length).toBeGreaterThan(0);
    for (const candidate of results) expect(isEligibleCandidate(member, candidate)).toBe(true);
  });

  it("excludes candidates outside the member's age range", () => {
    const member = completeMember({ ageMin: 18, ageMax: 25 });
    expect(getRecommendations(member, DISCOVERY_FIXTURES).some((candidate) => candidate.id === "fixture-01")).toBe(false);
  });

  it("requires the candidate's preferences to include the member too", () => {
    const member = completeMember({ gender: "man", interestedIn: ["woman"] });
    const candidate = DISCOVERY_FIXTURES.find((item) => item.id === "fixture-01")!;
    expect(isEligibleCandidate(member, { ...candidate, interestedIn: ["woman"] })).toBe(false);
  });

  it("excludes hidden profiles and previously passed/liked IDs", () => {
    const member = completeMember();
    const candidate = DISCOVERY_FIXTURES.find((item) => item.id === "fixture-01")!;
    expect(isEligibleCandidate({ ...member, visibility: "hidden" }, candidate)).toBe(false);
    expect(isEligibleCandidate(member, candidate, [candidate.id])).toBe(false);
  });

  it("does not recommend when the member has not supplied preference basics", () => {
    expect(getRecommendations(emptyProfile(), DISCOVERY_FIXTURES)).toEqual([]);
  });
});

describe("compatibility explanation", () => {
  it("uses shared interests and overlapping answers without making a guarantee", () => {
    const member = completeMember();
    const candidate = DISCOVERY_FIXTURES.find((item) => item.id === "fixture-01")!;
    const result = calculateCompatibility(member, candidate);
    expect(result.sharedInterests).toContain("Travel");
    expect(result.sharedAnswers).toBeGreaterThan(0);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.explanation.length).toBeGreaterThan(0);
  });

  it("does not give missing questionnaire answers a penalty", () => {
    const member = completeMember({ answers: {} });
    const candidate = DISCOVERY_FIXTURES[0]!;
    const result = calculateCompatibility(member, candidate);
    expect(result.sharedAnswers).toBe(0);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});
