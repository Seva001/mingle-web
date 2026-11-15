import { DEMO_PROFILE_STORAGE_KEY } from "@/lib/profile/sanitize";
import type { Profile } from "@/lib/profile/types";

/**
 * Legacy preview persistence for isolated demo surfaces. The member onboarding and profile
 * routes now use the authenticated Supabase-backed services in `lib/profile/server.ts` and
 * `lib/profile/actions.ts`; this store is retained only for tests and remaining preview features.
 */
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function subscribeDemoProfile(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === DEMO_PROFILE_STORAGE_KEY || e.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function readRawDemoProfile(): string | null {
  try {
    return window.localStorage.getItem(DEMO_PROFILE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export type SaveResult = { ok: true } | { ok: false; error: string };

export function saveDemoProfile(profile: Profile): SaveResult {
  try {
    window.localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    emit();
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Couldn’t save in this browser. Storage may be full or blocked. Try fewer or smaller photos.",
    };
  }
}

export function clearDemoProfile() {
  try {
    window.localStorage.removeItem(DEMO_PROFILE_STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
  emit();
}
