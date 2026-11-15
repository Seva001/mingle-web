import { QUESTIONS } from "@/lib/profile/options";
import type { Profile } from "@/lib/profile/types";
import {
  hasErrors,
  validateBasics,
  validateIntentions,
  validatePhotos,
  validatePreferences,
} from "@/lib/profile/validation";

export type SectionId = "basics" | "photos" | "intentions" | "questionnaire" | "preferences";

export type SectionStatus = {
  id: SectionId;
  label: string;
  complete: boolean;
  /** Required sections block "onboarding complete"; the questionnaire is optional (brief §6). */
  required: boolean;
  detail?: string;
};

export function profileSections(p: Profile): SectionStatus[] {
  const answered = QUESTIONS.filter((q) => p.answers[q.id] !== undefined).length;
  return [
    { id: "basics", label: "About you", complete: !hasErrors(validateBasics(p)), required: true },
    { id: "photos", label: "Photos", complete: validatePhotos(p.photos) === null, required: true },
    {
      id: "intentions",
      label: "What you’re looking for",
      complete: !hasErrors(validateIntentions(p)),
      required: true,
    },
    {
      id: "questionnaire",
      label: "Compatibility questions",
      complete: answered === QUESTIONS.length,
      required: false,
      detail: `${answered} of ${QUESTIONS.length} answered`,
    },
    {
      id: "preferences",
      label: "Who you’d like to meet",
      complete: !hasErrors(validatePreferences(p)),
      required: true,
    },
  ];
}

export function profileCompletion(p: Profile) {
  const sections = profileSections(p);
  const done = sections.filter((s) => s.complete).length;
  const onboardingComplete = sections.every((s) => s.complete || !s.required);
  const next =
    sections.find((s) => !s.complete && s.required) ?? sections.find((s) => !s.complete) ?? null;
  return {
    percent: Math.round((done / sections.length) * 100),
    sections,
    onboardingComplete,
    nextSection: next ? next.id : null,
  };
}
