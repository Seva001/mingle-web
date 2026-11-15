import {
  BIO_MAX,
  BIO_MIN,
  DISTANCE_CHOICES,
  MAX_DISCOVERY_AGE,
  MAX_VERIFIED_AGE,
  MAX_INTERESTS,
  MAX_PHOTOS,
  MIN_ADULT_AGE,
  MIN_INTERESTS,
} from "@/lib/profile/options";
import type { Profile } from "@/lib/profile/types";

type Errors<K extends string> = Partial<Record<K, string>>;

export type BasicsErrors = Errors<"displayName" | "age" | "gender" | "city" | "country" | "bio">;

export function validateBasics(
  p: Pick<Profile, "displayName" | "age" | "gender" | "city" | "country" | "bio">,
): BasicsErrors {
  const e: BasicsErrors = {};
  const name = p.displayName.trim();
  if (name.length < 2) e.displayName = "Enter the name you’d like to be shown (2 characters or more).";
  else if (name.length > 40) e.displayName = "Use 40 characters or fewer.";
  else if (/https?:\/\/|www\.|@/i.test(name)) {
    e.displayName = "Leave links and email addresses out of your name.";
  }

  if (p.age === null || !Number.isInteger(p.age)) e.age = "Enter your age as a whole number.";
  else if (p.age < MIN_ADULT_AGE) e.age = "Mingle is for adults aged 18 and over.";
  else if (p.age > MAX_VERIFIED_AGE) e.age = "Your age could not be confirmed.";

  if (!p.gender) e.gender = "Choose the option that fits you.";

  const city = p.city.trim();
  if (city.length < 2) e.city = "Enter your city or area.";
  else if (city.length > 60) e.city = "Use 60 characters or fewer.";

  const country = p.country.trim();
  if (country.length < 2) e.country = "Enter your country.";
  else if (country.length > 60) e.country = "Use 60 characters or fewer.";

  const bio = p.bio.trim();
  if (bio.length < BIO_MIN) e.bio = `Write a sentence or two (at least ${BIO_MIN} characters).`;
  else if (bio.length > BIO_MAX) e.bio = `Keep it to ${BIO_MAX} characters or fewer.`;
  return e;
}

export function validatePhotos(photos: Profile["photos"]): string | null {
  if (photos.length === 0) return "Add at least one photo.";
  if (photos.length > MAX_PHOTOS) return `You can add up to ${MAX_PHOTOS} photos.`;
  return null;
}

export type IntentionErrors = Errors<"intention" | "interests">;

export function validateIntentions(p: Pick<Profile, "intention" | "interests">): IntentionErrors {
  const e: IntentionErrors = {};
  if (!p.intention) e.intention = "Choose what you’re looking for.";
  if (p.interests.length < MIN_INTERESTS) e.interests = `Pick at least ${MIN_INTERESTS} interests.`;
  else if (p.interests.length > MAX_INTERESTS) e.interests = `Pick up to ${MAX_INTERESTS}.`;
  return e;
}

export type PreferenceErrors = Errors<"interestedIn" | "ageRange" | "distance">;

export function validatePreferences(
  p: Pick<Profile, "interestedIn" | "ageMin" | "ageMax" | "maxDistanceKm">,
): PreferenceErrors {
  const e: PreferenceErrors = {};
  if (p.interestedIn.length === 0) e.interestedIn = "Choose at least one option.";
  if (
    !Number.isInteger(p.ageMin) ||
    !Number.isInteger(p.ageMax) ||
    p.ageMin < MIN_ADULT_AGE ||
    p.ageMax > MAX_DISCOVERY_AGE
  ) {
    e.ageRange = `Ages must be between ${MIN_ADULT_AGE} and ${MAX_DISCOVERY_AGE}.`;
  } else if (p.ageMin > p.ageMax) {
    e.ageRange = "The youngest age can’t be higher than the oldest.";
  }
  if (!(DISTANCE_CHOICES as readonly (number | null)[]).includes(p.maxDistanceKm)) {
    e.distance = "Choose a distance.";
  }
  return e;
}

export const hasErrors = (e: object) => Object.keys(e).length > 0;
