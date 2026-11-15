import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME_PREFERENCE,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  parseStoredPreference,
  resolveTheme,
} from "@/lib/theme";

describe("theme preference", () => {
  it("defaults to light", () => {
    expect(DEFAULT_THEME_PREFERENCE).toBe("light");
    expect(parseStoredPreference(null)).toBe("light");
  });

  it("accepts the three valid preferences", () => {
    for (const v of ["light", "dark", "system"] as const) expect(parseStoredPreference(v)).toBe(v);
  });

  it("falls back to light for tampered or unknown values", () => {
    for (const v of ["", "Dark", "auto", "<script>", "undefined"]) {
      expect(parseStoredPreference(v)).toBe("light");
    }
  });

  it("resolves system from the OS setting and passes explicit choices through", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

describe("boot script", () => {
  const run = (stored: string | null, systemDark: boolean) => {
    const attrs: Record<string, string> = {};
    const style: Record<string, string> = {};
    const g = globalThis as Record<string, unknown>;
    const prev = { window: g.window, document: g.document };
    g.window = {
      localStorage: { getItem: (k: string) => (k === THEME_STORAGE_KEY ? stored : null) },
      matchMedia: () => ({ matches: systemDark }),
    };
    g.document = {
      documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v), style },
    };
    try {
      new Function(THEME_INIT_SCRIPT)();
    } finally {
      g.window = prev.window;
      g.document = prev.document;
    }
    return { theme: attrs["data-theme"], colorScheme: style.colorScheme };
  };

  it("applies stored light", () => expect(run("light", true).theme).toBe("light"));
  it("applies light by default", () => expect(run(null, true).theme).toBe("light"));
  it("follows the OS when preference is system", () => {
    expect(run("system", false)).toEqual({ theme: "light", colorScheme: "light" });
    expect(run("system", true)).toEqual({ theme: "dark", colorScheme: "dark" });
  });
  it("ignores garbage in storage", () => expect(run("pwned", true).theme).toBe("light"));
});
