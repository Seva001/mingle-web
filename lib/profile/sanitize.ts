import {
  BIO_MAX,
  DISTANCE_CHOICES,
  GENDERS,
  INTENTIONS,
  INTERESTS,
  MAX_DISCOVERY_AGE,
  MAX_PHOTOS,
  MIN_ADULT_AGE,
  findQuestion,
  type DistanceChoice,
  type Gender,
  type Interest,
  type Intention,
} from "@/lib/profile/options";
import { emptyProfile, type Profile, type ProfilePhoto } from "@/lib/profile/types";

export const DEMO_PROFILE_STORAGE_KEY = "mingle-demo-profile-v1";
const MAX_PHOTO_CHARS = 700_000;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const int = (v: unknown) => (typeof v === "number" && Number.isInteger(v) ? v : null);

/**
 * Anything read back from storage is untrusted (tampered, old format, partial). Keep only what
 * is valid and fall back to empty defaults for the rest. Never throws.
 */
export function parseStoredProfile(raw: string | null | undefined): Profile {
  const out = emptyProfile();
  if (!raw) return out;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return out;
  }
  if (!isRecord(data)) return out;

  out.displayName = str(data.displayName, 40);
  out.city = str(data.city, 60);
  out.country = str(data.country, 60);
  out.bio = str(data.bio, BIO_MAX);

  const age = int(data.age);
  out.age = age !== null && age >= MIN_ADULT_AGE && age <= MAX_DISCOVERY_AGE ? age : null;

  const genders = GENDERS.map((g) => g.value) as readonly string[];
  out.gender = genders.includes(String(data.gender)) ? (data.gender as Gender) : null;
  if (Array.isArray(data.interestedIn)) {
    out.interestedIn = [...new Set(data.interestedIn)].filter(
      (g): g is Gender => typeof g === "string" && genders.includes(g),
    );
  }

  const intentions = INTENTIONS.map((i) => i.value) as readonly string[];
  out.intention = intentions.includes(String(data.intention)) ? (data.intention as Intention) : null;

  if (Array.isArray(data.interests)) {
    out.interests = [...new Set(data.interests)].filter(
      (i): i is Interest => typeof i === "string" && (INTERESTS as readonly string[]).includes(i),
    );
  }

  if (Array.isArray(data.photos)) {
    out.photos = data.photos
      .filter(
        (p): p is ProfilePhoto =>
          isRecord(p) &&
          typeof p.id === "string" &&
          typeof p.dataUrl === "string" &&
          /^data:image\/(jpeg|png|webp);base64,/.test(p.dataUrl) &&
          p.dataUrl.length <= MAX_PHOTO_CHARS,
      )
      .slice(0, MAX_PHOTOS)
      .map((p) => ({ id: p.id.slice(0, 64), dataUrl: p.dataUrl }));
  }

  if (isRecord(data.answers)) {
    for (const [qid, oid] of Object.entries(data.answers)) {
      const q = findQuestion(qid);
      if (q && typeof oid === "string" && q.options.some((o) => o.id === oid)) out.answers[qid] = oid;
    }
  }

  const min = int(data.ageMin);
  const max = int(data.ageMax);
  if (min !== null && max !== null && min >= MIN_ADULT_AGE && max <= MAX_DISCOVERY_AGE && min <= max) {
    out.ageMin = min;
    out.ageMax = max;
  }
  if ((DISTANCE_CHOICES as readonly (number | null)[]).includes(data.maxDistanceKm as number | null)) {
    out.maxDistanceKm = data.maxDistanceKm as DistanceChoice;
  }
  out.visibility = data.visibility === "hidden" ? "hidden" : "visible";
  return out;
}
