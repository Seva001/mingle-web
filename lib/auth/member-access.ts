import { createClient } from "@/lib/supabase/server";
import { decideMemberAccess, type AccessDecision } from "@/lib/auth/access";

export async function getMemberAccess(): Promise<AccessDecision> {
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return decideMemberAccess(null);

    const { data: account, error } = await supabase
      .from("accounts")
      .select("status")
      .eq("id", userData.user.id)
      .maybeSingle();

    // Missing account rows and backend failures deny access; never fail open.
    if (error || !account) {
      return { allowed: false, reason: "account_blocked", destination: "/sign-in" };
    }

    return decideMemberAccess({
      emailVerified: Boolean(userData.user.email_confirmed_at),
      status: account.status,
    });
  } catch {
    return { allowed: false, reason: "account_blocked", destination: "/sign-in" };
  }
}

export async function clearMemberSession(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Access remains denied even if session cleanup is temporarily unavailable.
  }
}
