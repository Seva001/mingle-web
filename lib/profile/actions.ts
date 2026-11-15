"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DISTANCE_CHOICES, GENDERS, INTERESTS, INTENTIONS, QUESTIONS } from "@/lib/profile/options";
import type { Profile } from "@/lib/profile/types";

export type ProfileSaveResult = { ok: true } | { ok: false; message: string };

const isString = (value: unknown): value is string => typeof value === "string";
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const invalidProfile = (): ProfileSaveResult => ({
  ok: false,
  message: "Please review your profile details and try again.",
});

export async function reorderMyPhotosAction(photoIds: string[]): Promise<ProfileSaveResult> {
  if (!Array.isArray(photoIds) || photoIds.length > 6 || photoIds.some((id) => !isString(id) || !/^[0-9a-f-]{36}$/i.test(id))) {
    return { ok: false, message: "Invalid photo order." };
  }
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { ok: false, message: "Please sign in again." };
    const { error } = await supabase.rpc("reorder_my_profile_photos", { photo_ids: photoIds });
    return error ? { ok: false, message: "We couldn’t update your photo order." } : { ok: true };
  } catch {
    return { ok: false, message: "Photo services are unavailable right now." };
  }
}

export async function setMyProfileVisibilityAction(visible: boolean): Promise<ProfileSaveResult> {
  if (typeof visible !== "boolean") return { ok: false, message: "Choose a valid visibility setting." };
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { ok: false, message: "Please sign in again." };
    const { data: profile, error: readError } = await supabase.from("profiles").select("account_id").eq("account_id", userData.user.id).maybeSingle();
    if (readError || !profile) return { ok: false, message: "Complete your profile before changing its visibility." };
    const { error } = await supabase.from("profiles").update({ visibility: visible ? "visible" : "hidden" }).eq("account_id", userData.user.id);
    if (error) return { ok: false, message: "We couldn’t update your visibility setting." };
    revalidatePath("/profile");
    return { ok: true };
  } catch {
    return { ok: false, message: "Profile services are unavailable right now." };
  }
}

export async function saveMyProfileStepAction(
  section: "basics" | "intentions" | "questionnaire" | "preferences",
  profile: Profile,
): Promise<ProfileSaveResult> {
  if (!["basics", "intentions", "questionnaire", "preferences"].includes(section)
    || !isRecord(profile)) return invalidProfile();

  const candidate = profile as unknown as Record<string, unknown>;
  let data: Record<string, unknown>;

  if (section === "basics") {
    if (!isString(candidate.displayName) || !isString(candidate.gender)
      || !isString(candidate.city) || !isString(candidate.country) || !isString(candidate.bio)) return invalidProfile();
    const displayName = candidate.displayName.trim();
    const city = candidate.city.trim();
    const country = candidate.country.trim();
    const bio = candidate.bio.trim();
    if (displayName.length < 2 || displayName.length > 40
      || /https?:\/\/|www\.|@/i.test(displayName)
      || !GENDERS.some((item) => item.value === candidate.gender)
      || city.length < 2 || city.length > 60
      || country.length < 2 || country.length > 60
      || bio.length < 20 || bio.length > 500) return invalidProfile();
    data = { display_name: displayName, gender: candidate.gender, city, country, bio };
  } else if (section === "intentions") {
    if (!isString(candidate.intention) || !Array.isArray(candidate.interests)
      || !INTENTIONS.some((item) => item.value === candidate.intention)
      || candidate.interests.length < 3 || candidate.interests.length > 8
      || candidate.interests.some((item) => !isString(item) || !(INTERESTS as readonly string[]).includes(item))) {
      return { ok: false, message: "Choose an intention and between three and eight interests." };
    }
    data = { relationship_intention: candidate.intention, interests: candidate.interests };
  } else if (section === "preferences") {
    if (!Array.isArray(candidate.interestedIn)
      || candidate.interestedIn.length === 0
      || candidate.interestedIn.some((item) => !isString(item) || !GENDERS.some((option) => option.value === item))
      || !Number.isInteger(candidate.ageMin) || !Number.isInteger(candidate.ageMax)
      || (candidate.ageMin as number) < 18 || (candidate.ageMax as number) > 99
      || (candidate.ageMin as number) > (candidate.ageMax as number)
      || !(DISTANCE_CHOICES as readonly (number | null)[]).includes(candidate.maxDistanceKm as number | null)) {
      return { ok: false, message: "Please review your discovery preferences." };
    }
    data = { interested_in: candidate.interestedIn, age_min: candidate.ageMin, age_max: candidate.ageMax, max_distance_km: candidate.maxDistanceKm };
  } else {
    if (!isRecord(candidate.answers)) return invalidProfile();
    const answers = Object.entries(candidate.answers);
    if (answers.length > QUESTIONS.length || answers.some(([questionId, optionId]) =>
      !isString(optionId) || !QUESTIONS.find((question) => question.id === questionId)?.options.some((option) => option.id === optionId))) {
      return { ok: false, message: "One of those answers is no longer valid. Please review your answers." };
    }
    data = { answers: answers.map(([question_id, option_id]) => ({ question_id, option_id })) };
  }

  try {
    const supabase = await createClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) return { ok: false, message: "Please sign in again." };
    const { data: account, error: accountError } = await supabase.from("accounts").select("status").eq("id", userData.user.id).maybeSingle();
    if (accountError || account?.status !== "active") return { ok: false, message: "Your account is not yet eligible to save a member profile." };
    const result = await supabase.rpc("save_my_profile_step", { section_key: section, profile_data: data });
    if (result.error) return { ok: false, message: "We couldn’t save this section. Please try again." };
    revalidatePath("/profile");
    revalidatePath("/onboarding");
    return { ok: true };
  } catch {
    return { ok: false, message: "Profile services are unavailable right now. Please try again." };
  }
}
