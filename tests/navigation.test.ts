import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  authLinks,
  copyrightLine,
  footerGroups,
  heroAccountNote,
  heroCtas,
  isNavActive,
  navSectionIds,
  primaryNav,
} from "@/lib/site";

const root = new URL("..", import.meta.url).pathname;

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** app/(group)/foo/page.tsx -> /foo ; app/(marketing)/page.tsx -> / */
const routes = new Set(
  walk(join(root, "app"))
    .filter((f) => f.endsWith("/page.tsx"))
    .map((f) => {
      const rel = f.slice(join(root, "app").length, -"/page.tsx".length);
      const path = rel
        .split("/")
        .filter((seg) => seg && !/^\(.*\)$/.test(seg))
        .join("/");
      return "/" + path;
    }),
);

const source = [...walk(join(root, "app")), ...walk(join(root, "components"))]
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

// Since F2.5 the landing sections take their anchor ids from lib/marketing data (id: "..."),
// which the section components pass to <Section id={...}>.
const landingData = walk(join(root, "lib/marketing"))
  .filter((f) => f.endsWith(".ts"))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");
const hasAnchor = (hash: string) =>
  source.includes(`id="${hash}"`) || landingData.includes(`id: "${hash}"`);

const allLinks = [
  ...primaryNav,
  ...footerGroups.flatMap((g) => g.links),
  authLinks.signIn,
  authLinks.getStarted,
  heroCtas.primary,
  heroCtas.secondary,
  heroCtas.signIn,
];

describe("public navigation has no dead links (brief §15)", () => {
  for (const link of allLinks) {
    it(`${link.label} -> ${link.href}`, () => {
      const [path, hash] = link.href.split("#");
      expect(routes.has(path || "/")).toBe(true);
      if (hash) expect(hasAnchor(hash)).toBe(true);
    });
  }
});

describe("header navigation (task: marketing header)", () => {
  const byLabel = (label: string) => primaryNav.find((item) => item.label === label)!;

  it("lists Home, About, How it works, Help and Safety in order", () => {
    expect(primaryNav.map((item) => item.label)).toEqual([
      "Home",
      "About",
      "How it works",
      "Help",
      "Safety",
    ]);
  });

  it("exposes the section ids it links to", () => {
    expect(navSectionIds).toEqual(["how-it-works"]);
  });

  it("marks exactly one link active on each page route", () => {
    for (const [pathname, label] of [
      ["/", "Home"],
      ["/about", "About"],
      ["/help", "Help"],
      ["/safety", "Safety"],
    ] as const) {
      const active = primaryNav.filter((item) => isNavActive(item, pathname, null));
      expect(active.map((item) => item.label)).toEqual([label]);
    }
  });

  it("swaps Home for How it works while that section is in view", () => {
    expect(isNavActive(byLabel("Home"), "/", "how-it-works")).toBe(false);
    expect(isNavActive(byLabel("How it works"), "/", "how-it-works")).toBe(true);
    expect(isNavActive(byLabel("How it works"), "/", null)).toBe(false);
  });

  it("marks nothing active on routes outside the header (e.g. sign-in)", () => {
    expect(primaryNav.some((item) => isNavActive(item, "/sign-in", null))).toBe(false);
  });

  it("treats nested paths as part of their section but never matches look-alike prefixes", () => {
    expect(isNavActive(byLabel("Help"), "/help/anything", null)).toBe(true);
    expect(isNavActive(byLabel("Help"), "/helpful", null)).toBe(false);
  });
});

describe("marketing footer (F2.2)", () => {
  const labels = (title: string) =>
    footerGroups.find((g) => g.title === title)?.links.map((l) => l.label);
  const footerSource = readFileSync(join(root, "components/marketing/site-footer.tsx"), "utf8");

  it("has Product, Support and Legal groups with the required links", () => {
    expect(footerGroups.map((g) => g.title)).toEqual(["Product", "Support", "Legal"]);
    expect(labels("Product")).toEqual(["Home", "About", "How it works"]);
    expect(labels("Support")).toEqual(["Help", "FAQ", "Safety", "Contact"]);
    expect(labels("Legal")).toEqual(["Privacy", "Terms", "Cookies", "Community guidelines"]);
  });

  it("links Contact to the preview route without implying message delivery", () => {
    expect(routes.has("/contact")).toBe(true);
    expect(footerGroups.flatMap((g) => g.links).find((l) => l.label === "Contact")?.href).toBe("/contact");
    expect(readFileSync(join(root, "components/forms/contact-form.tsx"), "utf8")).toContain("no message can be delivered");
  });

  it("has no duplicate destinations", () => {
    const hrefs = footerGroups.flatMap((g) => g.links.map((l) => l.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("contains no external URLs (no invented social links)", () => {
    expect(/https?:\/\//.test(footerSource)).toBe(false);
    expect(footerGroups.flatMap((g) => g.links).every((l) => l.href.startsWith("/"))).toBe(true);
  });

  it("generates the copyright year instead of hard-coding it", () => {
    expect(copyrightLine(2031)).toBe("© 2031 Mingle. All rights reserved.");
    expect(footerSource).toContain("getFullYear()");
    expect(/©\s*\d{4}/.test(footerSource)).toBe(false);
  });

  it("uses theme tokens only (no hard-coded colours)", () => {
    const hardcoded =
      /#[0-9a-fA-F]{3,8}\b|\b(?:text|bg|border)-(?:white|black|gray|zinc|slate|neutral)/;
    expect(hardcoded.test(footerSource)).toBe(false);
  });
});

describe("landing hero and CTAs (F2.3)", () => {
  const read = (rel: string) => readFileSync(join(root, rel), "utf8");
  const heroSource = read("components/marketing/hero.tsx");
  const pageSource = read("app/(marketing)/page.tsx");

  it("primary CTA goes to sign-up and secondary to the how-it-works section", () => {
    expect(heroCtas.primary.href).toBe("/sign-up");
    expect(heroCtas.secondary.href).toBe("/sign-up");
    expect(heroCtas.signIn.href).toBe("/sign-in");
    expect(routes.has("/sign-up") && routes.has("/sign-in")).toBe(true);
  });

  it("renders the CTAs from the shared contract, with no hard-coded hrefs", () => {
    expect(heroSource).toContain("heroCtas.primary.href");
    expect(heroSource).toContain("heroCtas.secondary.href");
    expect(heroSource).toContain("heroCtas.signIn.href");
    expect(/href="/.test(heroSource)).toBe(false);
  });

  it("is a static server component: no forms, no client state, no simulated sign-up", () => {
    expect(/"use client"|<form|useState|onClick|onSubmit/.test(heroSource)).toBe(false);
  });

  it("is wired into the landing page, which keeps the single h1 inside the hero", () => {
    expect(pageSource).toContain("<Hero ");
    expect((heroSource.match(/<h1/g) ?? []).length).toBe(1);
    expect(pageSource.includes("<h1")).toBe(false);
    expect(heroSource).toContain('aria-labelledby="hero-title"');
    expect(heroSource).toContain('id="hero-title"');
  });

  it("states clearly that Mingle is for adults 18 and over", () => {
    expect(heroSource).toContain("For adults 18+");
    expect(heroSource).toContain("adults aged 18 and over");
  });

  it("contains no fabricated counts, statistics, testimonials or external URLs", () => {
    const fabricated =
      /testimonial|success stor|\b\d[\d,.]*\s?[kKmM]?\+?\s+(members|matches|users|couples|singles)\b|\b\d+\s?%\s+(?:of\b|match|compatib|success|satisf)|https?:\/\//i;
    const withoutComments = heroSource.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(fabricated.test(withoutComments)).toBe(false);
  });

  it("uses theme tokens only (no hard-coded colours)", () => {
    const hardcoded =
      /#[0-9a-fA-F]{3,8}\b|\b(?:text|bg|border)-(?:white|black|gray|zinc|slate|neutral)/;
    expect(hardcoded.test(heroSource)).toBe(false);
  });

  it("is honest about accounts: a note while unavailable, none once available", () => {
    const note = heroAccountNote(false);
    expect(typeof note).toBe("string");
    expect(note).toContain("can’t be completed");
    expect(heroAccountNote(true)).toBe(null);
    expect(heroSource).toContain("heroAccountNote(accountsAvailable)");
    expect(pageSource).toContain("const accountsAvailable = false;");
  });

  it("keeps the site-wide indexing setting and does not override it on the landing page", () => {
    expect(read("app/layout.tsx")).toContain("robots: { index: true, follow: true }");
    expect(/robots\s*:/.test(pageSource)).toBe(false);
  });

  it("motion is subtle and honours reduced-motion", () => {
    const css = read("styles/globals.css");
    expect(css).toContain("--animate-rise");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(heroSource).toContain("animate-rise");
  });
});
