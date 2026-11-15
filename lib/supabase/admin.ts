import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Privileged client for narrowly scoped server-only operations that must not be forgeable
 * through PostgREST/Storage with a member session (e.g. the image re-encoding upload pipeline).
 * Never import this module from a Client Component or expose its key through NEXT_PUBLIC_*.
 */
export function createAdminClient() {
  const { url } = getPublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceRoleKey || serviceRoleKey.length < 20) {
    throw new Error("Server-side Supabase storage credentials are not configured.");
  }
  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
