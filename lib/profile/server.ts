import "server-only";
import { createClient } from "@/lib/supabase/server";
import { emptyProfile, type Profile } from "@/lib/profile/types";

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return null;

  const { data: account } = await supabase
    .from("accounts")
    .select("status")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (account?.status !== "active") return null;

  const [profileResult, preferencesResult, answersResult, photosResult, ageResult, marketResult] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("account_id", authData.user.id).maybeSingle(),
      supabase.from("preferences").select("*").eq("account_id", authData.user.id).maybeSingle(),
      supabase.from("compatibility_answers").select("question_id, option_id").eq("account_id", authData.user.id),
      supabase.from("profile_photos").select("id, storage_path, position, moderation_state").eq("account_id", authData.user.id).order("position"),
      supabase.rpc("get_my_profile_age"),
      supabase.rpc("get_my_market_settings"),
    ]);

  if (profileResult.error || preferencesResult.error || answersResult.error || photosResult.error) {
    throw new Error("Your profile could not be loaded. Please try again.");
  }

  const base = emptyProfile();
  const profile = profileResult.data;
  const preferences = preferencesResult.data;
  const marketName = marketResult.data && typeof marketResult.data === "object"
    ? String((marketResult.data as Record<string, unknown>).market_name ?? "")
    : "";
  const photos = await Promise.all((photosResult.data ?? []).map(async (photo) => {
    const { data } = await supabase.storage.from("profile-photos").createSignedUrl(photo.storage_path, 300);
    return data?.signedUrl
      ? { id: photo.id, dataUrl: data.signedUrl, storagePath: photo.storage_path, moderationState: photo.moderation_state }
      : null;
  }));

  return {
    ...base,
    displayName: profile?.display_name ?? "",
    age: typeof ageResult.data === "number" ? ageResult.data : null,
    gender: (profile?.gender as Profile["gender"]) ?? null,
    city: profile?.city ?? "",
    country: marketName || profile?.country || "",
    bio: profile?.bio ?? "",
    photos: photos.filter((photo): photo is NonNullable<typeof photo> => photo !== null),
    intention: (profile?.relationship_intention as Profile["intention"]) ?? null,
    interests: (profile?.interests as Profile["interests"]) ?? [],
    answers: Object.fromEntries((answersResult.data ?? []).map((answer) => [answer.question_id, answer.option_id])),
    interestedIn: (preferences?.interested_in as Profile["interestedIn"]) ?? [],
    ageMin: preferences?.age_min ?? base.ageMin,
    ageMax: preferences?.age_max ?? base.ageMax,
    maxDistanceKm: (preferences?.max_distance_km as Profile["maxDistanceKm"]) ?? null,
    visibility: (profile?.visibility as Profile["visibility"]) ?? "visible",
  };
}
