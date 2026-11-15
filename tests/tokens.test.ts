import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../styles/themes.css", import.meta.url), "utf8");

/** Pull `--token: value;` pairs out of one rule block. */
function block(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  const body = css.slice(open + 1, close);
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--([\w-]+):\s*([^;]+);/g))
    out[m[1]!] = m[2]!.replace(/\/\*.*?\*\//g, "").trim();
  return out;
}

const dark = block(':root,\n[data-theme="dark"]');
const light = block('[data-theme="light"]');

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe("tokens match the brief (§3)", () => {
  it("dark theme", () => {
    expect(dark).toMatchObject({
      background: "#09090a",
      surface: "#161617",
      brand: "#ff6a1f",
      foreground: "#f4f4f6",
      muted: "#8e8e98",
      verified: "#4c8dff",
      star: "#ffc24b",
      "glass-fill": "rgba(255, 255, 255, 0.12)",
      "glass-border": "rgba(255, 255, 255, 0.18)",
    });
  });

  it("light theme", () => {
    expect(light).toMatchObject({
      background: "#f4f4f1",
      surface: "#ffffff",
      foreground: "#171719",
      muted: "#73737c",
      brand: "#ff6a1f",
      verified: "#4c8dff",
    });
  });

  it("both themes define the same set of tokens", () => {
    expect(Object.keys(light).sort()).toEqual(Object.keys(dark).sort());
  });
});

describe("contrast of the pairs the components actually use", () => {
  const themes = { dark, light } as const;
  for (const [name, t] of Object.entries(themes)) {
    it(`${name}: body text (AA 4.5:1)`, () => {
      expect(contrast(t.foreground!, t.background!)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.foreground!, t.surface!)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.muted!, t.surface!)).toBeGreaterThanOrEqual(4.5);
    });
    it(`${name}: text on the orange button (AA 4.5:1)`, () => {
      expect(contrast(t["on-brand"]!, t.brand!)).toBeGreaterThanOrEqual(4.5);
    });
    it(`${name}: focus ring and verified check (non-text 3:1)`, () => {
      expect(contrast(t.focus!, t.background!)).toBeGreaterThanOrEqual(3);
      expect(contrast(t["on-verified"]!, t.verified!)).toBeGreaterThanOrEqual(3);
    });
  }

  it("dark: muted text on the page background", () => {
    expect(contrast(dark.muted!, dark.background!)).toBeGreaterThanOrEqual(4.5);
  });

  // KNOWN ISSUE in the brief's light palette: #73737C on #F4F4F1 is ~4.3:1 (AA needs 4.5:1).
  // Rule until the owner decides: light-mode muted text goes on a white surface, or is >=18px.
  it("light: records the muted-on-background shortfall so a change is noticed", () => {
    const ratio = contrast(light.muted!, light.background!);
    expect(ratio).toBeGreaterThan(4.0);
    expect(ratio).toBeLessThan(4.5);
  });
});
