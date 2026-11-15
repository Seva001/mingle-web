import type { DistanceChoice, Gender, Interest, Intention } from "@/lib/profile/options";

export type ProfilePhoto = { id: string; dataUrl: string; storagePath?: string; moderationState?: "pending" | "approved" | "rejected" };

export type Profile = {
  displayName: string;
  /** Demo only. In the real app age is derived from the declared date of birth (Phase 2). */
  age: number | null;
  gender: Gender | null;
  /** Coarse place only. Never an exact or home location (brief §6). */
  city: string;
  country: string;
  bio: string;
  photos: ProfilePhoto[];
  intention: Intention | null;
  interests: Interest[];
  /** questionId -> optionId. Optional: members can skip any question. */
  answers: Record<string, string>;
  interestedIn: Gender[];
  ageMin: number;
  ageMax: number;
  maxDistanceKm: DistanceChoice;
  /** "hidden" keeps the profile out of discovery. */
  visibility: "visible" | "hidden";
};

export function emptyProfile(): Profile {
  return {
    displayName: "",
    age: null,
    gender: null,
    city: "",
    country: "",
    bio: "",
    photos: [],
    intention: null,
    interests: [],
    answers: {},
    interestedIn: [],
    ageMin: 18,
    ageMax: 60,
    maxDistanceKm: null,
    visibility: "visible",
  };
}
