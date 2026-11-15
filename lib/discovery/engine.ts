import { COMPATIBILITY_WEIGHTS } from "@/lib/compatibility/weights";
import type { Profile } from "@/lib/profile/types";
import type { CompatibilityResult, DiscoveryCandidate } from "@/lib/discovery/types";

function sharesMutualPreferences(member: Profile, candidate: DiscoveryCandidate): boolean {
  if (member.gender === null || candidate.gender === null) return false;
  if (!member.interestedIn.includes(candidate.gender)) return false;
  if (!candidate.interestedIn.includes(member.gender)) return false;
  if (candidate.age === null || member.age === null) return false;
  return (
    candidate.age >= member.ageMin &&
    candidate.age <= member.ageMax &&
    member.age >= candidate.ageMin &&
    member.age <= candidate.ageMax
  );
}

export function isEligibleCandidate(
  member: Profile,
  candidate: DiscoveryCandidate,
  excludedIds: readonly string[] = [],
): boolean {
  if (excludedIds.includes(candidate.id)) return false;
  if (member.visibility !== "visible" || candidate.visibility !== "visible") return false;
  if (member.age === null || member.age < 18 || candidate.age === null || candidate.age < 18) return false;
  if (!member.displayName.trim() || !member.gender || !member.interestedIn.length) return false;
  if (!sharesMutualPreferences(member, candidate)) return false;
  return true;
}

export function calculateCompatibility(member: Profile, candidate: DiscoveryCandidate): CompatibilityResult {
  const sharedInterests = member.interests.filter((interest) => candidate.interests.includes(interest));
  const alignedIntention = Boolean(member.intention && member.intention === candidate.intention);

  const signalMatches: Record<keyof typeof COMPATIBILITY_WEIGHTS, { matched: number; compared: number }> = {
    relationshipIntentions: { matched: alignedIntention ? 1 : 0, compared: member.intention && candidate.intention ? 1 : 0 },
    coreValues: { matched: 0, compared: 0 },
    lifestyle: { matched: 0, compared: 0 },
    interests: { matched: 0, compared: 0 },
    communicationPreferences: { matched: 0, compared: 0 },
  };

  for (const [questionId, answer] of Object.entries(member.answers)) {
    const candidateAnswer = candidate.answers[questionId];
    if (!candidateAnswer) continue;
    const question = questionId.startsWith("v_") ? "coreValues" : questionId.startsWith("l_") ? "lifestyle" : "communicationPreferences";
    signalMatches[question].compared += 1;
    if (answer === candidateAnswer) signalMatches[question].matched += 1;
  }

  signalMatches.interests.compared = Math.max(1, new Set([...member.interests, ...candidate.interests]).size);
  signalMatches.interests.matched = sharedInterests.length;

  let weighted = 0;
  let availableWeight = 0;
  for (const [signal, weight] of Object.entries(COMPATIBILITY_WEIGHTS) as [keyof typeof COMPATIBILITY_WEIGHTS, number][]) {
    const result = signalMatches[signal];
    if (result.compared === 0) continue;
    const ratio = Math.min(1, result.matched / result.compared);
    weighted += ratio * weight;
    availableWeight += weight;
  }

  const score = availableWeight > 0 ? Math.round((weighted / availableWeight) * 100) : 0;
  const explanation: string[] = [];
  if (alignedIntention) explanation.push("You share the same relationship intention");
  if (sharedInterests.length) explanation.push(`${sharedInterests.length} shared interest${sharedInterests.length === 1 ? "" : "s"}`);
  const answerCount = Object.entries(member.answers).filter(([id, value]) => Boolean(value && candidate.answers[id])).length;
  if (answerCount) explanation.push(`${answerCount} questionnaire answer${answerCount === 1 ? "" : "s"} align`);
  if (!explanation.length) explanation.push("Explore their profile and see what you have in common");

  return { score, sharedInterests, sharedAnswers: answerCount, alignedIntention, explanation };
}

export function getRecommendations(
  member: Profile,
  candidates: readonly DiscoveryCandidate[],
  excludedIds: readonly string[] = [],
): DiscoveryCandidate[] {
  return candidates.filter((candidate) => isEligibleCandidate(member, candidate, excludedIds));
}
