import { checkDeclaredAge } from "@/lib/auth/eligibility";
import type { AuthField } from "@/lib/auth/form-state";

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;
const EMAIL_MAX_LENGTH = 254;

type Checked<T> = { ok: true; value: T } | { ok: false; error: string };

/** Trimmed and lower-cased so one person cannot hold two accounts by changing case. */
export function validateEmail(raw: string): Checked<string> {
  const value = raw.trim().toLowerCase();
  if (!value) return { ok: false, error: "Enter your email address." };
  if (value.length > EMAIL_MAX_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
    return { ok: false, error: "Enter a valid email address, like name@example.com." };
  }
  return { ok: true, value };
}

/** Length over composition rules: long passphrases are stronger than forced symbols. */
export function validateNewPassword(raw: string, email: string): Checked<string> {
  if (raw.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, error: `Use at least ${PASSWORD_MIN_LENGTH} characters.` };
  }
  if (raw.length > PASSWORD_MAX_LENGTH) {
    return { ok: false, error: `Use no more than ${PASSWORD_MAX_LENGTH} characters.` };
  }
  if (email && raw.toLowerCase() === email.toLowerCase()) {
    return { ok: false, error: "Your password can’t be the same as your email address." };
  }
  return { ok: true, value: raw };
}

export type SignUpInput = {
  email: string;
  password: string;
  confirmPassword?: string;
  dateOfBirth: string;
  acceptedTerms: boolean;
};

export type SignUpValidation =
  | { ok: true; value: { email: string; password: string; dateOfBirth: string } }
  | { ok: false; underage: true; fieldErrors: Record<string, never> }
  | { ok: false; underage: false; fieldErrors: Partial<Record<AuthField, string>> };

export function validateSignUp(input: SignUpInput, now: Date = new Date()): SignUpValidation {
  // Under-18 wins over every other message: do not coach a minor through the rest of the form.
  const age = checkDeclaredAge(input.dateOfBirth, now);
  if (!age.ok && age.reason === "underage") return { ok: false, underage: true, fieldErrors: {} };

  const fieldErrors: Partial<Record<AuthField, string>> = {};

  const email = validateEmail(input.email);
  if (!email.ok) fieldErrors.email = email.error;

  const password = validateNewPassword(input.password, email.ok ? email.value : "");
  if (!password.ok) fieldErrors.password = password.error;
  if (input.confirmPassword !== undefined && input.confirmPassword !== input.password) {
    fieldErrors.confirmPassword = "Your passwords don’t match.";
  }

  if (!age.ok) {
    fieldErrors.dateOfBirth =
      age.reason === "invalid"
        ? "Enter your date of birth."
        : "That date of birth doesn’t look right. Check it and try again.";
  }
  if (!input.acceptedTerms) fieldErrors.terms = "Please confirm to continue.";

  if (Object.keys(fieldErrors).length > 0 || !email.ok || !password.ok) {
    return { ok: false, underage: false, fieldErrors };
  }
  return {
    ok: true,
    value: { email: email.value, password: password.value, dateOfBirth: input.dateOfBirth },
  };
}

export type SignInValidation =
  | { ok: true; value: { email: string; password: string } }
  | { ok: false; fieldErrors: Partial<Record<AuthField, string>> };

export function validateSignIn(input: { email: string; password: string }): SignInValidation {
  const fieldErrors: Partial<Record<AuthField, string>> = {};
  const email = validateEmail(input.email);
  if (!email.ok) fieldErrors.email = email.error;
  if (!input.password) fieldErrors.password = "Enter your password.";
  if (Object.keys(fieldErrors).length > 0 || !email.ok) return { ok: false, fieldErrors };
  return { ok: true, value: { email: email.value, password: input.password } };
}
