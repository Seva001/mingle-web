/** Runtime environment validation. Public values are safe to expose; secrets are not. */
export type AppEnvironment = "local" | "staging" | "production";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getAppEnvironment(): AppEnvironment {
  const value = process.env.NEXT_PUBLIC_APP_ENV?.trim() || "local";
  if (value === "local" || value === "staging" || value === "production") return value;
  throw new Error("NEXT_PUBLIC_APP_ENV must be local, staging or production");
}

export function getPublicEnv(): { url: string; publishableKey: string } {
  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP(S) URL");
  }

  if (
    (parsed.protocol !== "https:" && parsed.protocol !== "http:") ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a project origin without a path or credentials");
  }

  if (publishableKey.length < 20) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is invalid");
  }

  return { url: parsed.origin, publishableKey };
}

export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid HTTP(S) URL");
  }
  if (
    (parsed.protocol !== "https:" && parsed.protocol !== "http:") ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid HTTP(S) URL without credentials");
  }
  if (getAppEnvironment() === "production" && parsed.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS in production");
  }
  return parsed.toString().replace(/\/$/, "");
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
  );
}
