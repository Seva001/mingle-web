import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { COMPATIBILITY_WEIGHTS } from "@/lib/compatibility/weights";
import { compatibility, finalCta, howItWorks, trust, values } from "@/lib/marketing/landing";
import { authLinks, heroAccountNote } from "@/lib/site";

const root = new URL("..", import.meta.url).pathname;
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const components = {
  "how-it-works": read("components/marketing/how-it-works.tsx"),
  compatibility: read("components/marketing/compatibility.tsx"),
  experience: read("components/marketing/experience.tsx"),
  "trust-safety": read("components/marketing/trust-safety.tsx"),
  "final-cta": read("components/marketing/final-cta.tsx"),
} as const;
const allComponentSource = Object.values(components).join("\n");
const sharedGroundFigure = read("components/marketing/shared-ground-figure.tsx");
const heroVisual = read("components/marketing/hero-visual.tsx");
const pageSource = read("app/(marketing)/page.tsx");
const themes = read("styles/themes.css");

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

/** Copy in which the exclusion/disclaimer sentences may legitimately name what Mingle won't do. */
const guarded: string[] = [compatibility.disclaimer, compatibility.excluded];
const everything = strings({ howItWorks, compatibility, values, trust, finalCta });
const everythingExceptGuarded = everything.filter((s) => !guarded.includes(s));
const joined = everything.join("\n");

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const routes = new Set(
  walk(join(root, "app"))
    .filter((f) => f.endsWith("/page.tsx"))
    .map((f) => {
      const rel = f.slice(join(root, "app").length, -"/page.tsx".length);
      return "/" + rel.split("/").filter((seg) => seg && !/^\(.*\)$/.test(seg)).join("/");
    }),
);

describe("how it works: content (F2.5)", () => {
  it("covers account creation, profile and preferences, discovery and connection, in order", () => {
    expect(howItWorks.steps.map((s) => s.key)).toEqual(["account", "profile", "discover", "connect"]);
  });

  it("gives every step a title, a body and at least two details", () => {
    for (const step of howItWorks.steps) {
      expect(step.title.length > 0 && step.body.length > 0).toBe(true);
      expect(step.details.length >= 2).toBe(true);
    }
  });

  it("states adult-only eligibility in the account step", () => {
    expect(howItWorks.steps[0]!.body).toContain("adults aged 18 and over");
  });

  it("says plainly that accounts are not open and no step can be completed yet", () => {
    expect(howItWorks.status.body).toContain("Accounts aren’t open yet");
    expect(howItWorks.status.body).toContain("none of these steps can be completed");
  });

  it("describes connection as mutual, not automatic or guaranteed", () => {
    expect(howItWorks.steps[3]!.body).toContain("interested in you too");
  });

  it("does not describe unfinished features as live", () => {
    const live = /\b(now live|available now|live now|is live|are live|today you can|already (works|open))\b/i;
    expect(live.test(joined)).toBe(false);
  });
});

describe("compatibility: content (F2.5)", () => {
  const weightLabels: Record<keyof typeof COMPATIBILITY_WEIGHTS, string> = {
    relationshipIntentions: "Relationship intentions",
    coreValues: "Core values",
    lifestyle: "Lifestyle",
    interests: "Interests",
    communicationPreferences: "Communication preferences",
  };

  it("explains the same five signals the engine weights, by name only", () => {
    expect(compatibility.signals.map((s) => s.label).sort()).toEqual(
      Object.keys(COMPATIBILITY_WEIGHTS)
        .map((k) => weightLabels[k as keyof typeof COMPATIBILITY_WEIGHTS])
        .sort(),
    );
  });

  it("uses no numbers or percent signs anywhere in the landing copy (other than 18)", () => {
    expect(joined.replace(/\b18\b/g, "").match(/\d/g)).toBe(null);
    expect(joined.includes("%")).toBe(false);
  });

  it("says it will not show a percentage or score", () => {
    expect(compatibility.disclaimer).toContain("You won’t see a compatibility percentage or score");
  });

  it("states compatibility is guidance, not a guarantee", () => {
    expect(compatibility.disclaimerTitle).toBe("Guidance, not a guarantee");
    expect(compatibility.disclaimer).toContain("can’t predict");
    expect(compatibility.disclaimer).toContain("can’t guarantee a match or a relationship");
  });

  it("names religion, ethnicity, politics and health only to say they are not used", () => {
    const sensitive = /religio|politic|ethnic|health|race\b|sexual orientation|disabilit/i;
    expect(sensitive.test(everythingExceptGuarded.join("\n"))).toBe(false);
    for (const word of ["religion", "ethnicity", "politics", "health"]) {
      expect(compatibility.excluded).toContain(word);
    }
    expect(compatibility.excluded).toContain("doesn’t use");
  });

  it("does not present the weights or call the approach scientific or predictive", () => {
    expect(/weight|scientific|predict(s|ive)? (love|success)|proven/i.test(everythingExceptGuarded.join("\n"))).toBe(false);
  });
});

describe("messaging safety across the new sections (brief §6, §15)", () => {
  it("makes no overclaims, guarantees or safety promises", () => {
    const overclaim =
      /scientific|proven|proves|algorithm|perfect|soulmate|find love|100%|\bbest\b|guaranteed|\balways\b|\bnever\b|\b(safe|safest|secure|protected)\b|fully verified|24\/7/i;
    expect(overclaim.test(everythingExceptGuarded.join("\n"))).toBe(false);
  });

  it("invents no statistics, member counts, testimonials, success stories or profiles", () => {
    const social =
      /testimonial|success stor|thousands|millions|\bcouples?\b|reviews?\b|\bmembers? (have|are|say|love)\b|\bjoin(ed)? (us|the)\b|rated|trusted by/i;
    expect(social.test(joined)).toBe(false);
  });

  it("does not claim legal approval, compliance or certification", () => {
    const legal = /legally (approved|reviewed by)|approved by|compliant|certified|GDPR|lawyer|solicitor/i;
    expect(legal.test(joined)).toBe(false);
    expect(trust.legalNote).toContain("haven’t been published or legally reviewed");
  });
});

describe("trust and safety: content and honesty (F2.5)", () => {
  it("communicates adult-only eligibility (18+) and that the date of birth is a declaration, not proof", () => {
    expect(trust.adult.mark).toBe("18+");
    expect(trust.adult.body).toContain("adults aged 18 and over");
    expect(trust.adult.body).toContain("a declaration rather than proof");
    expect(/age[- ](check|assurance|verified)/i.test(trust.adult.body)).toBe(false);
  });

  it("covers responsible discovery, privacy and respectful interaction", () => {
    expect(trust.pillars.map((p) => p.key)).toEqual(["discovery", "privacy", "respect"]);
    for (const p of trust.pillars) expect(p.points.length >= 3).toBe(true);
  });

  it("phrases privacy and respectful-interaction points as intent, not as live features", () => {
    const intent = /aim|plan|being|intended|designed/i;
    for (const key of ["privacy", "respect"] as const) {
      const pillar = trust.pillars.find((p) => p.key === key)!;
      for (const point of pillar.points) expect(intent.test(point)).toBe(true);
    }
  });

  it("lists the safeguards that are not live, with a state label that is not 'live'", () => {
    const labels = trust.status.items.map((i) => i.label);
    for (const needed of [
      "Account sign-up",
      "Blocking and reporting",
      "Moderation and support",
    ]) {
      expect(labels).toContain(needed);
    }
    for (const item of trust.status.items) {
      expect(/live|available|active|operational|enabled/i.test(item.state.replace(/not /i, ""))).toBe(false);
    }
  });

  it("matches the source: no age-assurance provider is integrated, and none is promised", () => {
    expect(existsSync(join(process.cwd(), "lib/auth/age-assurance.ts"))).toBe(false);
    expect(trust.status.items.map((i) => i.label)).not.toContain("Age assurance provider");
  });

  it("matches the source: safety, guidelines and privacy pages are still unpublished placeholders", () => {
    expect(read("app/(marketing)/safety/page.tsx")).toContain("not transmitted, stored or reviewed yet");
    expect(read("app/(marketing)/community-guidelines/page.tsx")).toContain("moderation, evidence handling, appeals");
    expect(read("components/marketing/legal-document.tsx")).toContain("Draft — not a published legal policy");
    for (const link of trust.links) expect(link.label).toContain("(in progress)");
  });

  it("matches the source: member access is fail-closed on email and account status, with no provider gate", () => {
    const access = read("lib/auth/access.ts");
    expect(access).toContain("emailVerified");
    expect(access).toContain("eligibility_pending");
    expect(access).not.toContain("ageAssurance");
  });
});

describe("final call to action (F2.5)", () => {
  it("uses the shared sign-up and sign-in links", () => {
    expect(finalCta.primary).toBe(authLinks.getStarted);
    expect(finalCta.signIn).toBe(authLinks.signIn);
  });

  it("only links to routes that exist or anchors that exist on the home page", () => {
    const ids = read("lib/marketing/landing.ts");
    for (const link of [finalCta.primary, finalCta.signIn, finalCta.safety, ...trust.links]) {
      const [path, hash] = link.href.split("#");
      expect(routes.has(path || "/")).toBe(true);
      if (hash) expect(ids.includes(`id: "${hash}"`)).toBe(true);
    }
    expect(finalCta.safety.href).toBe(`/#${trust.id}`);
  });

  it("states 18+ and is honest when accounts are unavailable", () => {
    expect(finalCta.adultLine).toContain("18 and over");
    expect(components["final-cta"]).toContain("heroAccountNote(accountsAvailable)");
    expect(heroAccountNote(false)).toContain("sign-up can’t be completed");
    expect(heroAccountNote(true)).toBe(null);
  });

  it("fabricates no registration: plain links only, no form, state, handler or success message", () => {
    const forbidden = /"use client"|useState|useEffect|onClick|onSubmit|<form|action=|fetch\(|success|welcome|you’re in|account created/i;
    const code = components["final-cta"].replace(/\/\*[\s\S]*?\*\//g, "");
    expect(forbidden.test(code)).toBe(false);
    expect(/success|welcome|created|registered/i.test(strings(finalCta).join("\n"))).toBe(false);
  });
});

describe("semantics and structure", () => {
  it("every section is a static server component: no client state, effects or handlers", () => {
    const forbidden = /"use client"|useState|useEffect|useRef|onClick|onChange|dangerouslySetInnerHTML/;
    for (const [name, src] of Object.entries(components)) {
      expect(`${name}:${forbidden.test(src)}`).toBe(`${name}:false`);
    }
  });

  it("each section contributes exactly one h2 (via Section, or its own) and never an h1", () => {
    for (const name of ["how-it-works", "compatibility", "experience", "trust-safety"] as const) {
      expect(components[name]).toContain("<Section");
      expect(/<h1|<h2/.test(components[name])).toBe(false);
    }
    expect(read("components/marketing/section.tsx")).toContain("<h2");
    expect((components["final-cta"].match(/<h2/g) ?? []).length).toBe(1);
    expect(/<h1/.test(allComponentSource)).toBe(false);
  });

  it("labels the final CTA section with its heading", () => {
    expect(components["final-cta"]).toContain('aria-labelledby="final-cta-title"');
    expect(components["final-cta"]).toContain('id="final-cta-title"');
  });

  it("uses distinct stable section ids, and keeps the ids existing links rely on", () => {
    const ids = [howItWorks.id, compatibility.id, values.id, trust.id, finalCta.id];
    expect(new Set(ids).size).toBe(ids.length);
    expect(howItWorks.id).toBe("how-it-works");
    expect(compatibility.id).toBe("approach");
  });

  it("uses an ordered list for the journey, with step numbers announced to screen readers", () => {
    expect(components["how-it-works"]).toContain("<ol");
    expect(components["how-it-works"]).toContain("sr-only");
    expect(components["how-it-works"]).toContain("Step {index + 1}");
  });

  it("uses lists and description lists for grouped content, and h3 under each h2", () => {
    expect(components.compatibility).toContain("<dl");
    expect(components["trust-safety"]).toContain("<dl");
    for (const name of ["how-it-works", "compatibility", "experience", "trust-safety"] as const) {
      expect(components[name]).toContain("<h3");
    }
  });

  it("hides decorative icons from assistive tech and keeps the photo's meaning in text", () => {
    expect(components.compatibility).toContain("aria-hidden");
    expect(sharedGroundFigure).toContain("<figcaption");
    expect(components["trust-safety"]).toContain("aria-hidden");
    expect(trust.adult.body).toContain("18 and over");
  });

  it("does not rely on colour alone: statuses are written out", () => {
    for (const item of trust.status.items) expect(item.state.length > 0).toBe(true);
    expect(components["trust-safety"]).toContain("{item.state}");
  });

  it("keeps navigation to native links, with a 44px minimum target for inline links", () => {
    expect(components["trust-safety"]).toContain("min-h-11");
    expect(/role="link"|<a /.test(allComponentSource)).toBe(false);
  });

  it("keeps the section components image-free; the two marketing photos live in dedicated figures with alt text and no overlays naming people", () => {
    expect(/<img|<Image|next\/image/.test(allComponentSource)).toBe(false);
    for (const source of [sharedGroundFigure, heroVisual]) {
      expect(source).toMatch(/alt="[^"]{20,}"/);
      expect(/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(source)).toBe(false);
    }
    expect(sharedGroundFigure).toContain("/images/compatibility-shared-ground.jpg");
    expect(heroVisual).toContain("/images/hero-phone.jpg");
    expect(existsSync(join(root, "public/images/hero-phone.jpg"))).toBe(true);
    expect(existsSync(join(root, "public/images/compatibility-shared-ground.jpg"))).toBe(true);
  });
});

describe("page composition", () => {
  it("renders hero, introduction, how it works, compatibility, values, trust and final CTA in order", () => {
    const order = [
      "<Hero ",
      "<Introduction />",
      "<HowItWorks />",
      "<Compatibility />",
      "<Experience />",
      "<TrustSafety />",
      "<FinalCta ",
    ].map((tag) => pageSource.indexOf(tag));
    expect(order.every((i) => i > -1)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("no longer contains the old inline placeholder sections", () => {
    for (const old of ["Made for how people actually meet", "Tell us about yourself", "Signals may include"]) {
      expect(pageSource.includes(old)).toBe(false);
    }
  });

  it("passes account availability to the hero and the final CTA from one source", () => {
    expect(pageSource).toContain("const accountsAvailable = false;");
    expect(pageSource).toContain("<FinalCta accountsAvailable={accountsAvailable} />");
  });

  it("preserves indexing restrictions", () => {
    expect(/robots\s*:/.test(pageSource)).toBe(false);
    expect(read("app/layout.tsx")).toContain("robots: { index: true, follow: true }");
    expect(read("app/robots.ts")).toContain('allow: "/"');
  });

  it("leaves header, footer, hero and the F2.4 introduction free of new section wiring", () => {
    for (const f of ["site-header", "site-footer", "hero", "introduction"]) {
      expect(/landing"|HowItWorks|TrustSafety|FinalCta/.test(read(`components/marketing/${f}.tsx`))).toBe(false);
    }
  });
});

describe("responsive behaviour (class contract)", () => {
  it("stacks on mobile and enlarges columns at sm, md and lg without fixed widths", () => {
    expect(components["how-it-works"]).toContain("md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]");
    expect(components.compatibility).toContain("sm:grid-cols-3");
    expect(components.compatibility).toContain("lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]");
    expect(components.experience).toContain("sm:grid-cols-2");
    expect(components["trust-safety"]).toContain("lg:grid-cols-3");
    expect(components["final-cta"]).toContain("flex-col");
    expect(components["final-cta"]).toContain("sm:flex-row");
  });

  it("guards against overflow: min-w-0 on grid children and no fixed pixel widths", () => {
    for (const [name, src] of Object.entries(components)) {
      // The final CTA is a single block with no grid, so it has no grid children to guard.
      if (name !== "final-cta") expect(src).toContain("min-w-0");
      expect(/\b(w|min-w)-\[\d+px\]/.test(src)).toBe(false);
    }
  });

  it("makes final CTA buttons full width on mobile", () => {
    expect(components["final-cta"]).toContain("w-full sm:w-auto");
  });
});

describe("theme tokens and motion", () => {
  it("uses theme tokens only: no hard-coded colours or palette utilities", () => {
    const hardcoded = /#[0-9a-fA-F]{3,8}\b|rgba?\(|\b(?:text|bg|border)-(?:white|black|gray|zinc|slate|neutral)/;
    expect(hardcoded.test(allComponentSource)).toBe(false);
  });

  it("limits gradients and blur to the one brand glow that already existed, built from var(--brand)", () => {
    const withGradient = Object.entries(components).filter(([, s]) => /gradient|blur/.test(s));
    expect(withGradient.map(([n]) => n)).toEqual(["final-cta"]);
    expect(components["final-cta"]).toContain("var(--brand)");
  });

  it("adds no new motion; the global reduced-motion rule is still present", () => {
    expect(/animate-|transition|duration-|motion-/.test(allComponentSource)).toBe(false);
    expect(read("styles/globals.css")).toContain("prefers-reduced-motion");
  });

  const block = (start: string) => {
    const from = themes.indexOf(start);
    return themes.slice(from, themes.indexOf("}", from));
  };
  const token = (css: string, name: string) => new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)![1]!;
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
      .map((i) => Math.round(channel(fg, i) * alpha + channel(bg, i) * (1 - alpha)).toString(16).padStart(2, "0"))
      .join("");

  for (const [name, start] of [
    ["dark", ':root,\n[data-theme="dark"]'],
    ["light", '[data-theme="light"] {'],
  ] as const) {
    it(`${name}: secondary text (foreground/70) is AA on background, surface and surface-raised`, () => {
      const css = block(start);
      const fg = token(css, "foreground");
      for (const s of ["background", "surface", "surface-raised"]) {
        const bg = token(css, s);
        expect(ratio(blend(fg, bg, 0.7), bg) >= 4.5).toBe(true);
      }
    });

    it(`${name}: step numbers and the 18+ mark (on-brand on brand) are AA`, () => {
      const css = block(start);
      expect(ratio(token(css, "on-brand"), token(css, "brand")) >= 4.5).toBe(true);
    });

    it(`${name}: the brand accent is never used as small text colour in the new sections`, () => {
      expect(/\btext-brand\b/.test(allComponentSource)).toBe(false);
    });
  }

  it("uses the Inter-based font tokens through existing utilities, not new font declarations", () => {
    expect(/font-family|@font-face|fontFamily/.test(allComponentSource)).toBe(false);
  });

  it("every new section uses the strong secondary tone, because light-theme muted is below AA", () => {
    for (const name of ["how-it-works", "compatibility", "experience", "trust-safety"] as const) {
      expect(components[name]).toContain('tone="strong"');
    }
    expect(/\btext-muted\b/.test(allComponentSource)).toBe(false);
  });
});
