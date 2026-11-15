// Kept out of the "use server" file: those may only export async functions.
export type AuthField = "email" | "password" | "confirmPassword" | "dateOfBirth" | "terms" | "marketCode";

export type AuthFormState = {
  status: "idle" | "error" | "unavailable" | "underage";
  message?: string;
  fieldErrors?: Partial<Record<AuthField, string>>;
  /** Echoed back so the member does not retype it. Passwords are never echoed. */
  email?: string;
};

export const initialAuthFormState: AuthFormState = { status: "idle" };

export const MESSAGES = {
  underage: "You must be 18 or older to use Mingle.",
  unavailable:
    "Accounts aren’t switched on in this environment yet, so nothing was submitted.",
  signInFailed: "That email and password don’t match. Check them and try again.",
  generic: "Something went wrong on our side. Please try again in a moment.",
} as const;

/** Deterrent only (a cookie can be cleared). The database also rejects under-18 dates of birth. */
export const AGE_GATE_COOKIE = "mingle_age_gate";
export const AGE_GATE_SECONDS = 60 * 60 * 24;
