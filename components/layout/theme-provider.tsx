"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  DEFAULT_THEME_PREFERENCE,
  THEME_STORAGE_KEY,
  parseStoredPreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Fallback when storage is blocked, so the choice still applies for this page view. */
let memoryPreference: ThemePreference = DEFAULT_THEME_PREFERENCE;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribePreference(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback); // keeps other tabs in sync
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function readPreference(): ThemePreference {
  try {
    return parseStoredPreference(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return memoryPreference;
  }
}

const darkQuery = "(prefers-color-scheme: dark)";

function subscribeSystem(callback: () => void) {
  const mq = window.matchMedia(darkQuery);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useSyncExternalStore(
    subscribePreference,
    readPreference,
    () => DEFAULT_THEME_PREFERENCE,
  );
  const systemDark = useSyncExternalStore(
    subscribeSystem,
    () => window.matchMedia(darkQuery).matches,
    () => true,
  );

  const resolved = resolveTheme(preference, systemDark);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
  }, [resolved]);

  const setPreference = useCallback((next: ThemePreference) => {
    memoryPreference = next;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage blocked: memoryPreference carries the choice */
    }
    emit();
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
