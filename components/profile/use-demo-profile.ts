"use client";

import { useMemo, useSyncExternalStore } from "react";
import { readRawDemoProfile, subscribeDemoProfile } from "@/lib/profile/demo-store";
import { parseStoredProfile } from "@/lib/profile/sanitize";
import type { Profile } from "@/lib/profile/types";

/** `null` until the browser copy has been read (server render and first paint). */
export function useDemoProfile(): Profile | null {
  const raw = useSyncExternalStore<string | null | undefined>(
    subscribeDemoProfile,
    readRawDemoProfile,
    () => undefined,
  );
  return useMemo(() => (raw === undefined ? null : parseStoredProfile(raw)), [raw]);
}
