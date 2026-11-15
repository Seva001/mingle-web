import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

type ReportRecord = {
  id: string; category: string; details: string; status: string; priority: string;
  created_at: string; target_account_id: string | null; target_display_name: string | null;
};
type PendingPhoto = { id: string; display_name: string | null; storage_path: string; created_at: string; signed_url?: string };
type AuditRecord = { id: number; actor_account_id: string | null; action: string; target_type: string; target_id: string; metadata: Record<string, unknown>; created_at: string };
type AdminWorkspace =
  | { configured: false }
  | { configured: true; authorized: false; unavailable?: boolean }
  | { configured: true; authorized: true; isAdmin: boolean; reports: ReportRecord[]; photos: PendingPhoto[]; audit: AuditRecord[] };

export async function getAdminWorkspace(): Promise<AdminWorkspace> {
  if (!isSupabaseConfigured()) return { configured: false as const };
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return { configured: true as const, authorized: false as const };
    const { data: moderator, error: roleError } = await supabase.rpc("has_admin_role", { allowed_roles: ["admin", "moderator", "support"] });
    if (roleError || !moderator) return { configured: true as const, authorized: false as const };

    const { data: queue, error: queueError } = await supabase.rpc("get_admin_moderation_queue", { result_limit: 50 });
    if (queueError) throw queueError;
    const payload = (queue ?? {}) as { reports?: ReportRecord[]; pending_photos?: PendingPhoto[] };
    const photos = payload.pending_photos ?? [];
    let signedPhotos = photos;
    if (photos.length) {
      const admin = createAdminClient();
      signedPhotos = await Promise.all(photos.map(async (photo) => {
        const { data } = await admin.storage.from("profile-photos").createSignedUrl(photo.storage_path, 300);
        return { ...photo, signed_url: data?.signedUrl };
      }));
    }
    const { data: isAdmin } = await supabase.rpc("has_admin_role", { allowed_roles: ["admin"] });
    let audit: AuditRecord[] = [];
    if (isAdmin) {
      const { data, error } = await supabase.rpc("get_admin_audit_events", { result_limit: 50 });
      if (error) throw error;
      audit = (data ?? []) as AuditRecord[];
    }
    return { configured: true as const, authorized: true as const, isAdmin: Boolean(isAdmin), reports: payload.reports ?? [], photos: signedPhotos, audit };
  } catch {
    return { configured: true as const, authorized: false as const, unavailable: true as const };
  }
}
