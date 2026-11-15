import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.next({ request });

  try {
    const { url, publishableKey } = getPublicEnv();
    let response = NextResponse.next({ request });

    const supabase = createServerClient<Database>(url, publishableKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // @supabase/ssr >= 0.10 passes cache-safety headers with refreshed cookies.
          // They prevent an intermediary cache from sharing a response containing a session.
          for (const [name, value] of Object.entries(headers ?? {})) {
            response.headers.set(name, value);
          }
        },
      },
    });

    // Verifies the token and refreshes it when required. Do not use getSession() as an auth check.
    await supabase.auth.getClaims();
    return response;
  } catch {
    // Public pages remain available during configuration/network failures. Protected member
    // routes independently verify the user and account record, and deny access on any failure.
    return NextResponse.next({ request });
  }
}
