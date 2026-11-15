import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type DiscoveryPhoto = { id: string; url: string };
export type MemberCandidate = {
  id: string;
  displayName: string;
  age: number;
  gender: "woman" | "man" | "non_binary";
  city: string;
  country: string;
  bio: string;
  intention: string;
  interests: string[];
  sharedInterests: string[];
  sharedAnswers: number;
  alignedIntention: boolean;
  photos: DiscoveryPhoto[];
};
export type MemberConnection = {
  connectionId: string;
  id: string;
  displayName: string;
  age: number;
  city: string;
  country: string;
  bio: string;
  connectedAt: string;
};
export type SavedMember = Omit<MemberConnection, "connectionId" | "connectedAt">;

type CandidateRow = {
  id: string; display_name: string; age: number; gender: MemberCandidate["gender"];
  city: string; country: string; bio: string; intention: string; interests: string[];
  shared_interests: string[];
  shared_answers: number;
  aligned_intention: boolean;
  photos: { id: string; storage_path: string }[];
};

async function requireActiveClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: account } = await supabase.from("accounts").select("status").eq("id", user.id).maybeSingle();
  return account?.status === "active" ? supabase : null;
}

export async function getDiscoveryCandidates(limit = 24, offset = 0): Promise<MemberCandidate[]> {
  const supabase = await requireActiveClient();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_discovery_candidates", { result_limit: limit, result_offset: offset });
  if (error) throw new Error("Discovery profiles could not be loaded.");
  const rows = (data ?? []) as unknown as CandidateRow[];
  if (!rows.length) return [];

  // Paths come only from the narrowly scoped discovery RPC. The service role signs approved
  // images; neither the bucket nor its objects are made public.
  const admin = createAdminClient();
  return Promise.all(rows.map(async (row) => {
    const photos = await Promise.all(row.photos.map(async (photo) => {
      const { data: signed } = await admin.storage.from("profile-photos").createSignedUrl(photo.storage_path, 300);
      return signed?.signedUrl ? { id: photo.id, url: signed.signedUrl } : null;
    }));
    return {
      id: row.id, displayName: row.display_name, age: row.age, gender: row.gender,
      city: row.city, country: row.country, bio: row.bio, intention: row.intention,
      interests: row.interests ?? [], sharedInterests: row.shared_interests ?? [],
      sharedAnswers: row.shared_answers ?? 0, alignedIntention: row.aligned_intention ?? false,
      photos: photos.filter((photo): photo is DiscoveryPhoto => photo !== null),
    };
  }));
}

export async function getMyConnections(): Promise<MemberConnection[]> {
  const supabase = await requireActiveClient();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_my_connections");
  if (error) throw new Error("Your connections could not be loaded.");
  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map((row) => ({
    connectionId: String(row.connection_id), id: String(row.id), displayName: String(row.display_name),
    age: Number(row.age), city: String(row.city), country: String(row.country),
    bio: String(row.bio), connectedAt: String(row.connected_at),
  }));
}

export async function getMySavedProfiles(): Promise<SavedMember[]> {
  const supabase = await requireActiveClient();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_my_saved_profiles");
  if (error) throw new Error("Your saved profiles could not be loaded.");
  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id), displayName: String(row.display_name), age: Number(row.age),
    city: String(row.city), country: String(row.country), bio: String(row.bio),
  }));
}
