"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthBackend } from "@/lib/auth/backend";
import { getSiteUrl } from "@/lib/env";
import {
  AGE_GATE_COOKIE,
  AGE_GATE_SECONDS,
  MESSAGES,
  type AuthFormState,
} from "@/lib/auth/form-state";
import { validateSignIn, validateSignUp } from "@/lib/validation/auth";
import { getEnabledMarkets } from "@/lib/markets/server";
import { checkDeclaredAgeForMinimum } from "@/lib/auth/eligibility";

const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
};

export async function signUpAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const jar = await cookies();
  if (jar.get(AGE_GATE_COOKIE)) return { status: "underage", message: MESSAGES.underage };

  const email = text(formData, "email");
  const result = validateSignUp({
    email,
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
    dateOfBirth: text(formData, "dateOfBirth"),
    acceptedTerms: formData.get("terms") === "on",
  });

  if (!result.ok) {
    if (result.underage) {
      // Nothing about the attempt is stored. The cookie only stops an instant retry with a new date.
      jar.set(AGE_GATE_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: AGE_GATE_SECONDS,
        path: "/",
      });
      return { status: "underage", message: MESSAGES.underage };
    }
    return { status: "error", fieldErrors: result.fieldErrors, email };
  }

  const marketCode = text(formData, "marketCode").trim().toUpperCase();
  const markets = await getEnabledMarkets();
  const market = markets.find((item) => item.code === marketCode);
  if (!market) {
    return { status: "error", fieldErrors: { marketCode: "Choose a market that is currently accepting registrations." }, email };
  }

  const marketAge = checkDeclaredAgeForMinimum(result.value.dateOfBirth, market.minimumAge);
  if (!marketAge.ok) {
    return { status: "error", fieldErrors: { dateOfBirth: `You must be at least ${market.minimumAge} to register in this market.` }, email };
  }

  const backend = getAuthBackend();
  const outcome = await backend.signUp({ ...result.value, marketCode });
  if (!outcome.ok) {
    return {
      status: outcome.code === "unavailable" ? "unavailable" : "error",
      message: outcome.code === "unavailable" ? MESSAGES.unavailable : MESSAGES.generic,
      email,
    };
  }
  // Email confirmation is off, so the member is already signed in. The member layout decides
  // where they may go (market open + declared adult), not this redirect.
  redirect("/onboarding");
}

export async function signInAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = text(formData, "email");
  const result = validateSignIn({ email, password: text(formData, "password") });
  if (!result.ok) return { status: "error", fieldErrors: result.fieldErrors, email };

  const backend = getAuthBackend();
  const outcome = await backend.signIn(result.value);
  if (!outcome.ok) {
    if (outcome.code === "unavailable") {
      return { status: "unavailable", message: MESSAGES.unavailable, email };
    }
    return {
      status: "error",
      message: outcome.code === "invalid_credentials" ? MESSAGES.signInFailed : MESSAGES.generic,
      email,
    };
  }
  // The member layout decides where they may go (declared-adult and market gate), not this redirect.
  redirect("/discover");
}

export async function signOutAction() {
  const backend = getAuthBackend();
  await backend.signOut();
  redirect("/sign-in");
}

export async function resendVerificationAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = text(formData, "email").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { status: "error", fieldErrors: { email: "Enter a valid email address." } };
  }
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/discover` } });
  } catch {
    // Keep the response generic: do not reveal whether an account exists.
  }
  return { status: "idle", message: "If an unconfirmed account exists for that address, a confirmation email has been requested.", email };
}

export async function forgotPasswordAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = text(formData, "email").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { status: "error", fieldErrors: { email: "Enter a valid email address." } };
  }
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/reset-password`,
    });
  } catch {
    // Same public response whether the address exists or not.
  }
  return { status: "idle", message: "If an account exists for that address, a password reset link has been sent.", email };
}

export async function updatePasswordAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = text(formData, "password");
  const confirmation = text(formData, "confirmPassword");
  if (password.length < 10 || password.length > 128) {
    return { status: "error", fieldErrors: { password: "Use between 10 and 128 characters." } };
  }
  if (password !== confirmation) {
    return { status: "error", fieldErrors: { confirmPassword: "Your passwords don’t match." } };
  }
  let updated = false;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.updateUser({ password });
    updated = !error && Boolean(data.user);
  } catch {
    updated = false;
  }
  if (!updated) return { status: "error", message: "This reset link is invalid or expired. Request a new one." };
  redirect("/sign-in?password=updated");
}
