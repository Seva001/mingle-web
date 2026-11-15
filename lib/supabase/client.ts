"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getPublicEnv } from "@/lib/env";

let browserClient: SupabaseClient<Database> | undefined;

export function createClient(): SupabaseClient<Database> {
  if (!browserClient) {
    const { url, publishableKey } = getPublicEnv();
    browserClient = createBrowserClient<Database>(url, publishableKey);
  }
  return browserClient;
}
