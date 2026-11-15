import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/env";

export type AuthOutcome =
  | { ok: true }
  | { ok: false; code: "invalid_credentials" | "unavailable" | "failed" };

export interface AuthBackend {
  signUp(input: { email: string; password: string; dateOfBirth: string; marketCode: string }): Promise<AuthOutcome>;
  signIn(input: { email: string; password: string }): Promise<AuthOutcome>;
  signOut(): Promise<void>;
}

const authBackend: AuthBackend = {
  async signUp(input) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/discover`,
          // The database trigger copies this declaration into a restricted table.
          // It is a declaration, not proof of age; the database still enforces 18+ and the market minimum.
          data: {
            date_of_birth: input.dateOfBirth,
            market_code: input.marketCode,
            terms_accepted: true,
            privacy_accepted: true,
          },
        },
      });
      // Keep the response generic to avoid account enumeration.
      return error ? { ok: false, code: "failed" } : { ok: true };
    } catch {
      return { ok: false, code: "unavailable" };
    }
  },
  async signIn(input) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (!error) return { ok: true };
      if (error.message.toLowerCase().includes("invalid login credentials") ||
          error.message.toLowerCase().includes("email not confirmed")) {
        return { ok: false, code: "invalid_credentials" };
      }
      return { ok: false, code: "failed" };
    } catch {
      return { ok: false, code: "unavailable" };
    }
  },
  async signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
  },
};

export function getAuthBackend(): AuthBackend {
  return authBackend;
}
