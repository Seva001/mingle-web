import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { introduction } from "@/lib/marketing/introduction";

const root = new URL("..", import.meta.url).pathname;
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const componentSource = read("components/marketing/introduction.tsx");
const pageSource = read("app/(marketing)/page.tsx");
const sectionSource = read("components/marketing/section.tsx");

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const allCopy = strings(introduction);
const copyExceptNote = strings({ ...introduction, note: "" });
const joined = allCopy.join("\n");

describe("landing introduction: content (F2.4)", () => {
  it("explains what Mingle is, for adults 18+ and compatibility-first", () => {
    expect(introduction.eyebrow).toBe("What Mingle is");
    expect(introduction.lead).toContain("compatibility-first");
    expect(introduction.lead).toContain("adults aged 18 and over");
  });

  it("covers the problem and why compatibility matters", () => {
    expect(introduction.blocks.map((b) => b.title)).toEqual([
      "The problem we’re addressing",
      "Why compatibility matters",
    ]);
  });

  it("contrasts swipe-first discovery with Mingle in several rows, each with both sides", () => {
    expect(introduction.comparison.rows.length >= 3).toBe(true);
    for (const row of introduction.comparison.rows) {
      expect(row.aspect.length > 0 && row.swipe.length > 0 && row.mingle.length > 0).toBe(true);
    }
  });

  it("keeps the comparison generic: no named competitor apps", () => {
    expect(/tinder|bumble|hinge|grindr|badoo|okcupid|match\.com|feeld/i.test(joined)).toBe(false);
    expect(introduction.comparison.note).toContain("not a comparison with any particular app");
  });

  it("emphasises shared values, lifestyle, intentional discovery and meaningful connection", () => {
    expect(introduction.pillars.map((p) => p.key)).toEqual([
      "values",
      "lifestyle",
      "discovery",
      "connection",
    ]);
  });
});

describe("landing introduction: messaging safety (brief §6, §15)", () => {
  it("makes no scientific, proven or guaranteed claims", () => {
    const overclaim =
      /scientific|proven|proves|algorithm|perfect|soulmate|find love|100%|best|guaranteed|always|never fail/i;
    expect(overclaim.test(copyExceptNote.join("\n"))).toBe(false);
  });

  it("invents no statistics, member counts, testimonials or success stories", () => {
    const digitsOtherThan18 = joined.replace(/\b18\b/g, "").match(/\d/g);
    expect(digitsOtherThan18).toBe(null);
    const social = /testimonial|success stor|thousands|millions|\bjoin(ed)?\b|couples? (met|found)/i;
    expect(social.test(joined)).toBe(false);
  });

  it("states plainly that compatibility is not a promise", () => {
    expect(introduction.note).toContain("starting point, not a promise");
    expect(introduction.note).toContain("can’t guarantee a match or a relationship");
  });

  it("mentions sensitive traits only to say they are not used", () => {
    const sensitive = /religio|politic|ethnic|health|race\b|sexual orientation|disabilit/i;
    expect(sensitive.test(copyExceptNote.join("\n"))).toBe(false);
    expect(sensitive.test(introduction.note)).toBe(true);
    expect(introduction.note).toContain("doesn’t use sensitive traits");
  });
});

describe("landing introduction: implementation", () => {
  it("is a static server component with no client state, images, links or fake profiles", () => {
    const forbidden = /"use client"|useState|useEffect|onClick|<img|<Image|<a |<Link|href=/;
    expect(forbidden.test(componentSource)).toBe(false);
  });

  it("uses the shared Section (which provides the h2) with a stable id and the strong tone", () => {
    expect(componentSource).toContain("<Section");
    expect(componentSource).toContain("id={introduction.id}");
    expect(componentSource).toContain('tone="strong"');
    expect(/<h1|<h2/.test(componentSource)).toBe(false);
    expect(sectionSource).toContain("<h2");
    expect(introduction.id).toBe("introduction");
  });

  it("uses semantic structure: h3 sub-headings, a description list and a list", () => {
    expect(componentSource).toContain("<h3");
    expect(componentSource).toContain("<dl");
    expect(componentSource).toContain("<dt");
    expect(componentSource).toContain("<dd");
    expect(componentSource).toContain("<ul");
  });

  it("labels each side of the comparison in text, not by colour or icon alone", () => {
    expect(componentSource).toContain("comparison.swipeLabel");
    expect(componentSource).toContain("comparison.mingleLabel");
  });

  it("maps an icon for every pillar", () => {
    for (const p of introduction.pillars) expect(componentSource).toContain(`${p.key}:`);
  });

  it("is responsive: stacked on mobile, 2-up on tablet, split or 4-up on desktop, no overflow", () => {
    expect(componentSource).toContain("lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]");
    expect(componentSource).toContain("sm:grid-cols-2 lg:grid-cols-4");
    expect(componentSource).toContain("min-w-0");
  });

  it("uses theme tokens only: no hard-coded colours, gradients, glass or blur", () => {
    const hardcoded =
      /#[0-9a-fA-F]{3,8}\b|\b(?:text|bg|border)-(?:white|black|gray|zinc|slate|neutral)|gradient|glass|blur/;
    expect(hardcoded.test(componentSource)).toBe(false);
  });

  it("is rendered on the landing page between the hero and how-it-works, replacing the old stub", () => {
    const hero = pageSource.indexOf("<Hero ");
    const intro = pageSource.indexOf("<Introduction />");
    const how = pageSource.indexOf("<HowItWorks />");
    expect(hero > -1 && intro > hero && how > intro).toBe(true);
    expect(pageSource.includes("Not just another profile")).toBe(false);
  });

  it("keeps Section's default tone unchanged for every other section", () => {
    expect(sectionSource).toContain('tone = "default"');
    expect(sectionSource).toContain('"text-muted"');
  });

  it("does not touch indexing: no robots override on the landing page", () => {
    expect(/robots\s*:/.test(pageSource)).toBe(false);
    expect(read("app/layout.tsx")).toContain("robots: { index: true, follow: true }");
  });
});

describe("landing introduction: contrast in both themes (WCAG AA 4.5:1 for small text)", () => {
  const themes = read("styles/themes.css");
  const block = (start: string) => {
    const from = themes.indexOf(start);
    return themes.slice(from, themes.indexOf("}", from));
  };
  const token = (css: string, name: string) =>
    new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)![1]!;
  const channel = (hex: string, i: number) => parseInt(hex.slice(i, i + 2), 16);
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const v = channel(hex, i) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a: string, b: string) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
    return (hi + 0.05) / (lo + 0.05);
  };
  const blend = (fg: string, bg: string, alpha: number) =>
    "#" +
    [1, 3, 5]
      .map((i) =>
        Math.round(channel(fg, i) * alpha + channel(bg, i) * (1 - alpha))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("");

  for (const [name, start] of [
    ["dark", ':root,\n[data-theme="dark"]'],
    ["light", '[data-theme="light"] {'],
  ] as const) {
    it(`${name}: foreground/70 text is AA on the page and card backgrounds`, () => {
      const css = block(start);
      const fg = token(css, "foreground");
      for (const surface of [token(css, "background"), token(css, "surface")]) {
        expect(ratio(blend(fg, surface, 0.7), surface) >= 4.5).toBe(true);
      }
    });

    it(`${name}: the brand check mark (on-brand on brand) is AA`, () => {
      const css = block(start);
      expect(ratio(token(css, "on-brand"), token(css, "brand")) >= 4.5).toBe(true);
    });
  }

  it("documents why the strong tone exists: light-theme muted on the background is below AA", () => {
    const css = block('[data-theme="light"] {');
    expect(ratio(token(css, "muted"), token(css, "background")) < 4.5).toBe(true);
  });
});
