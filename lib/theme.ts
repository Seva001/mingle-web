/**
 * Theme logic shared by the inline boot script, the provider and the tests.
 * Light / Dark / System, default Light, persisted across sessions.
 */
export const THEME_STORAGE_KEY = "mingle-theme";

export const THEME_PREFERENCES = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = "light" | "dark";

/** Light is the default; explicit saved preferences still take priority. */
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "light";

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && (THEME_PREFERENCES as readonly string[]).includes(value);
}

/** Anything unrecognised (tampered, missing, old format) falls back to the default. */
export function parseStoredPreference(raw: string | null | undefined): ThemePreference {
  return isThemePreference(raw) ? raw : DEFAULT_THEME_PREFERENCE;
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === "system") return systemPrefersDark ? "dark" : "light";
  return preference;
}

/**
 * Runs before first paint (inlined in <head>) so there is no flash of the wrong theme.
 * Must stay dependency-free and wrapped in try/catch: storage can be blocked.
 */
export const THEME_INIT_SCRIPT = `(function(){var r="${DEFAULT_THEME_PREFERENCE}";try{var s=null;try{s=window.localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}var p=(s==="light"||s==="dark"||s==="system")?s:"${DEFAULT_THEME_PREFERENCE}";r=p==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p}catch(e){}var d=document.documentElement;d.setAttribute("data-theme",r);d.style.colorScheme=r})();`;
