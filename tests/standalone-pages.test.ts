import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DISCOVERY_FIXTURES } from "@/lib/discovery/fixtures";
import { compatibility, howItWorks } from "@/lib/marketing/landing";
import {
  about,
  featureStatuses,
  journey,
  journeyStages,
  type FeatureStatus,
} from "@/lib/marketing/pages";
import {
  INTENTIONS,
  MAX_INTERESTS,
  MAX_PHOTOS,
  MIN_INTERESTS,
  QUESTIONS,
} from "@/lib/profile/options";

const root = new URL("..", import.meta.url).pathname;
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const aboutPage = read("app/(marketing)/about/page.tsx");
const journeyPage = read("app/(marketing)/how-it-works/page.tsx");
const pageHeader = read("components/marketing/page-header.tsx");
const statusBadge = read("components/marketing/status-badge.tsx");
const pageSources = { about: aboutPage, "how-it-works": journeyPage };
const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "");
const pageHeaderCode = stripComments(pageHeader);
const allSource = stripComments([aboutPage, journeyPage, pageHeader, statusBadge].join("\n"));

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const aboutCopy = strings(about).join("\n");
const journeyCopy = strings({ journey, featureStatuses }).join("\n");
const allCopy = `${aboutCopy}\n${journeyCopy}`;

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

const features = journeyStages.flatMap((stage) => stage.features);
const featureNamed = (title: string) => features.find((f) => f.title === title)!;

describe("about page: content (F2.10)", () => {
  it("explains purpose, philosophy, audience and direction", () => {
    expect(about.purpose.title.length > 0 && about.purpose.paragraphs.length >= 2).toBe(true);
    expect(about.philosophy.principles.length >= 4).toBe(true);
    expect(about.audience.body.length > 0).toBe(true);
    expect(about.direction.stages.length >= 3).toBe(true);
  });

  it("states what Mingle is: compatibility-first, for adults aged 18 and over", () => {
    expect(about.lead).toContain("compatibility-first");
    expect(about.lead).toContain("adults aged 18 and over");
    expect(about.audience.body).toContain("adults aged 18 and over");
  });

  it("says plainly that Mingle is not open yet and has no members", () => {
    expect(about.status.body).toContain("isn’t open yet");
    expect(about.status.body).toContain("there are no members");
  });

  it("invents no company history, founders, team, funding or achievements", () => {
    const invented =
      /\bfound(ed|er|ers|ing)\b|co-?founder|established|\bour (team|story|history|founders?)\b|\bawards?\b|award-winning|launched in|backed by|investors?|funding|\bCEO\b|years? (of|in)|milestone|headquarter|based in|team of|we (started|began|built up)|since (the|\d)/i;
    expect(invented.test(aboutCopy)).toBe(false);
  });

  it("invents no statistics, member counts, testimonials or success stories", () => {
    const social =
      // \breviews?\b is anchored at both ends: the landing guard's looser form would match "preview".
      /testimonial|success stor|thousands|millions|\bcouples?\b|\breviews?\b|\bmembers? (have|are|say|love)\b|\bjoin(ed)? (us|the)\b|\brated\b|trusted by/i;
    expect(social.test(allCopy)).toBe(false);
    expect(allCopy.replace(/\b18\b/g, "").match(/\d/g)).toBe(null);
    expect(allCopy.includes("%")).toBe(false);
  });

  it("makes no overclaims, guarantees or safety promises", () => {
    const overclaim =
      /scientific|proven|proves|algorithm|perfect|soulmate|find love|100%|\bbest\b|guaranteed|\balways\b|\bnever\b|\b(safe|safest|secure|protected)\b|fully verified|24\/7|predict(s|ive)? (love|success)/i;
    expect(overclaim.test(allCopy)).toBe(false);
  });

  it("states compatibility is guidance, not a prediction or guarantee", () => {
    expect(about.philosophy.principles.map((p) => p.title)).toContain("Understanding over prediction");
    expect(about.lines.items).toContain("Mingle can’t guarantee a match or a relationship.");
  });

  it("names religion, ethnicity, politics and health only through the shared exclusion sentence", () => {
    const sensitive = /religio|politic|ethnic|health|race\b|sexual orientation|disabilit/i;
    expect(sensitive.test(allCopy)).toBe(false);
    expect(aboutPage).toContain("compatibility.excluded");
    expect(compatibility.excluded).toContain("doesn’t use");
  });

  it("describes the direction as intent and names what is still undecided", () => {
    for (const stage of about.direction.stages) {
      expect(/meant|planned|expect|designed/i.test(stage.body)).toBe(true);
    }
    for (const open of ["launch", "languages", "priced", "under-18 accounts"]) {
      expect(about.direction.open).toContain(open);
    }
  });

  it("matches the product: the relationship intentions it lists exist in the profile options", () => {
    const text = about.audience.body;
    expect(text).toContain("long-term relationship");
    expect(text).toContain("marriage");
    expect(text).toContain("dating to see where it goes");
    expect(text).toContain("friendship first");
    expect(INTENTIONS.map((i) => i.value)).toEqual(
      expect.arrayContaining(["long_term", "marriage", "dating_open", "friendship_first"]),
    );
  });

  it("does not describe unfinished features as live", () => {
    const live = /\b(now live|available now|live now|is live|are live|today you can|already (works|open))\b/i;
    expect(live.test(allCopy)).toBe(false);
  });
});

describe("how it works page: journey and eligibility (F2.11)", () => {
  it("covers eligibility, profile, preferences, discovery and mutual connections, in order", () => {
    expect(journeyStages.map((s) => s.key)).toEqual([
      "eligibility",
      "profile",
      "preferences",
      "discovery",
      "connections",
    ]);
  });

  it("gives every stage a title, a body and several features, each with a valid status", () => {
    for (const stage of journeyStages) {
      expect(stage.title.length > 0 && stage.body.length > 0).toBe(true);
      expect(stage.features.length >= 4).toBe(true);
      for (const feature of stage.features) {
        expect(feature.title.length > 0 && feature.body.length > 0).toBe(true);
        expect(Object.keys(featureStatuses)).toContain(feature.status);
      }
    }
  });

  it("uses every status at least once, so planned and available features are both shown", () => {
    const used = new Set<FeatureStatus>(features.map((f) => f.status));
    expect([...used].sort()).toEqual(["development", "planned", "preview"]);
  });

  it("defines each status in plain words and has no 'live' status", () => {
    expect(Object.keys(featureStatuses).sort()).toEqual(["development", "planned", "preview"]);
    expect(featureStatuses.preview.label).toBe("Available in preview");
    expect(featureStatuses.development.label).toBe("In development");
    expect(featureStatuses.planned.label).toBe("Planned");
    expect(/\blive\b/i.test(strings(featureStatuses).join("\n"))).toBe(false);
  });

  it("says nothing is open to the public and no one can complete the journey today", () => {
    expect(journey.legend.note).toContain("Nothing on this page is open to the public");
    expect(journey.legend.note).toContain("Accounts aren’t open yet");
    expect(journey.legend.note).toContain("no one can complete this journey");
  });

  it("states adult-only eligibility, and that a typed date of birth is not proof of age", () => {
    const eligibility = journeyStages[0]!;
    expect(eligibility.body).toContain("adults aged 18 and over");
    expect(featureNamed("Date of birth at sign-up").body).toContain("isn’t proof of age");
  });

  it("describes connection as mutual, with messaging only after mutual interest", () => {
    const connections = journeyStages[4]!;
    expect(connections.body).toContain("show interest in you");
    expect(connections.body).toContain("only once interest is mutual");
  });

  it("makes no guarantee, statistic, testimonial or sensitive-trait claim (see also the About checks)", () => {
    expect(journeyCopy.replace(/\b18\b/g, "").match(/\d/g)).toBe(null);
    expect(journeyCopy.includes("%")).toBe(false);
  });

  it("reuses the landing disclaimer and exclusion instead of rewording them", () => {
    expect(journeyPage).toContain("compatibility.disclaimer");
    expect(journeyPage).toContain("compatibility.disclaimerTitle");
    expect(journeyPage).toContain("compatibility.excluded");
    expect(compatibility.disclaimer).toContain("You won’t see a compatibility percentage or score");
  });
});

describe("how it works page: statuses match the source (F2.11)", () => {
  // Each assertion ties a status label to the code behind it. When the code changes, the label
  // is out of date and the test fails as a prompt to revisit the page.

  it("no age-assurance provider is integrated, so no age check is promised", () => {
    expect(existsSync(join(process.cwd(), "lib/auth/age-assurance.ts"))).toBe(false);
    for (const title of ["Date of birth at sign-up", "Access closed until your market opens"]) {
      expect(featureNamed(title).status).toBe("development");
    }
    expect(journeyCopy.includes("Age check")).toBe(false);
    expect(featureNamed("Email and password").status).toBe("development");
  });

  it("email confirmation is not required, and there is no separate age-check page", () => {
    expect(existsSync(join(process.cwd(), "app/(auth)/verify/page.tsx"))).toBe(false);
    expect(read("lib/auth/actions.ts")).not.toContain('redirect("/verify")');
  });

  it("the member-access rule exists but is fail-closed code, not an enforced gate", () => {
    const access = read("lib/auth/access.ts");
    expect(access).toContain('subject.status === "pending"');
    expect(read("app/(member)/layout.tsx")).not.toContain("decideMemberAccess");
  });

  it("the profile details match the limits in the profile options", () => {
    expect(MAX_PHOTOS).toBe(6);
    expect(featureNamed("Photos").body).toContain("up to six photos");
    expect(MIN_INTERESTS).toBe(3);
    expect(MAX_INTERESTS).toBe(8);
    expect(featureNamed("Interests").body).toContain("between three and eight");
    expect(QUESTIONS.length).toBe(8);
    expect(featureNamed("Compatibility questions").body).toContain("Eight short questions");
  });

  it("the questions are skippable, as the page says", () => {
    expect(read("lib/profile/types.ts")).toContain("Optional: members can skip any question");
  });

  it("photos are re-encoded in the browser, as the page says", () => {
    const photo = read("lib/profile/photo.ts");
    expect(photo).toContain("re-encodes as JPEG");
    expect(photo).toContain("EXIF");
  });

  it("discovery remains browser-only while profile sections use authenticated persistence", () => {
    expect(read("lib/profile/demo-store.ts")).toMatch(/localStorage/);
    expect(read("components/profile/onboarding-flow.tsx")).toContain("saveMyProfileStepAction");
    expect(read("components/discovery/discovery-experience.tsx")).toContain(
      "All actions are stored locally in this browser only",
    );
    expect(featureNamed("Saving to an account").status).toBe("development");
  });

  it("the preview has a hide-profile switch and the engine leaves hidden profiles out", () => {
    expect(read("components/profile/profile-overview.tsx")).toContain("setVisibility");
    const engine = read("lib/discovery/engine.ts");
    expect(engine).toContain('member.visibility !== "visible"');
    expect(featureNamed("Hide your profile").status).toBe("development");
  });

  it("the engine applies mutual gender and age preferences and leaves out anyone under 18", () => {
    const engine = read("lib/discovery/engine.ts");
    expect(engine).toContain("member.interestedIn.includes(candidate.gender)");
    expect(engine).toContain("candidate.interestedIn.includes(member.gender)");
    expect(engine).toContain("candidate.age < 18");
    expect(featureNamed("Mutual preferences").status).toBe("preview");
  });

  it("the engine does not apply distance yet, so Distance is not labelled as available", () => {
    // If this fails, distance has been implemented: move "Distance" to preview.
    expect(read("lib/discovery/engine.ts")).not.toContain("maxDistanceKm");
    expect(featureNamed("Distance").status).toBe("development");
  });

  it("suggestions give reasons in words, from intention, interests and answers", () => {
    const engine = read("lib/discovery/engine.ts");
    expect(engine).toContain("You share the same relationship intention");
    expect(engine).toContain("shared interest");
    expect(engine).toContain("questionnaire answer");
    expect(featureNamed("Reasons in words").status).toBe("preview");
  });

  it("every profile in the preview is a labelled synthetic fixture, so real members are planned", () => {
    expect(DISCOVERY_FIXTURES.every((c) => c.demoLabel === "synthetic_fixture")).toBe(true);
    expect(featureNamed("Real members").status).toBe("planned");
    expect(journeyStages[3]!.note).toContain("made-up sample data");
  });

  it("showing interest creates no connection in the preview, and connections/chats remain honest", () => {
    expect(read("components/discovery/discovery-experience.tsx")).toContain(
      "This does not notify or connect to anyone",
    );
    expect(read("components/member/connections-view.tsx")).toContain("not a match");
    expect(read("components/member/chats-view.tsx")).toContain("does not create chats, send messages");
    expect(featureNamed("Showing interest").body).toContain("doesn’t notify anyone or create a connection");
    for (const title of ["Mutual interest", "Your connections", "Conversations"]) {
      expect(featureNamed(title).status).toBe("planned");
    }
  });

  it("blocking and reporting have local preview controls but no real enforcement", () => {
    expect(featureNamed("Blocking and reporting").status).toBe("development");
    expect(featureNamed("Moderation and support").status).toBe("planned");
    expect(read("components/safety/report-form.tsx")).toContain("has not been sent or stored");
    expect(read("components/discovery/discovery-experience.tsx")).toContain("local demo discovery only");
    expect(howItWorks.status.body).toContain("none of these steps can be completed");
  });
});

describe("standalone pages: routes, links and structure", () => {
  const links = [
    about.links.primary,
    about.links.secondary,
    journey.cta.primary,
    journey.cta.secondary,
    journey.cta.safety,
    howItWorks.more,
  ];

  it("/about and /how-it-works are real pages, and how-it-works no longer redirects", () => {
    expect(routes.has("/about")).toBe(true);
    expect(routes.has("/how-it-works")).toBe(true);
    expect(journeyPage.includes("redirect(")).toBe(false);
    expect(aboutPage.includes("PhasePlaceholder")).toBe(false);
  });

  it("every link on the pages resolves to an existing route", () => {
    for (const link of links) {
      const [path] = link.href.split("#");
      expect(routes.has(path || "/")).toBe(true);
    }
  });

  it("unpublished destinations are labelled as in progress", () => {
    for (const link of [about.links.secondary, journey.cta.safety]) {
      expect(link.label).toContain("(in progress)");
    }
    expect(read("app/(marketing)/safety/page.tsx")).toContain("not transmitted, stored or reviewed yet");
    expect(read("app/(marketing)/community-guidelines/page.tsx")).toContain("moderation, evidence handling, appeals");
    expect(read("components/marketing/legal-document.tsx")).toContain("Draft — not a published legal policy");
  });

  it("the landing How it works section links to the standalone page and keeps its anchor", () => {
    expect(howItWorks.more.href).toBe("/how-it-works");
    expect(howItWorks.id).toBe("how-it-works");
    expect(read("components/marketing/how-it-works.tsx")).toContain("howItWorks.more.href");
  });

  it("each page renders exactly one h1, through PageHeader, and never a second", () => {
    expect((pageHeaderCode.match(/<h1/g) ?? []).length).toBe(1);
    for (const [name, src] of Object.entries(pageSources)) {
      expect(`${name}:${/<h1/.test(src)}`).toBe(`${name}:false`);
      expect(src).toContain("<PageHeader");
    }
  });

  it("uses an ordered list for the journey, with step numbers announced to screen readers", () => {
    expect(journeyPage).toContain("<ol");
    expect(journeyPage).toContain("Step {index + 1}");
    expect(aboutPage).toContain("<ol");
    expect(aboutPage).toContain("Stage {index + 1}");
  });

  it("explains the status labels in a description list and shows them as text, not colour alone", () => {
    expect(journeyPage).toContain("<dl");
    expect(statusBadge).toContain("featureStatuses[status].label");
    const iconFor = /preview: Check,\s*development: Wrench,\s*planned: Clock/;
    expect(iconFor.test(statusBadge)).toBe(true);
    expect(statusBadge).toContain("border-dashed");
  });

  it("keeps the badge's text size: classes are joined directly, because cn() would drop text-caption", () => {
    const code = stripComments(statusBadge).replace(/^\s*\/\/.*$/gm, "");
    expect(code.includes("cn(")).toBe(false);
    expect(code).toContain("text-caption");
  });

  it("is honest about accounts, using the same helper as the hero and final CTA", () => {
    expect(journeyPage).toContain("heroAccountNote(false)");
    expect(/success|welcome|account created|registered/i.test(strings(journey.cta).join("\n"))).toBe(false);
  });

  it("is static: server components with no client state, effects, handlers or forms", () => {
    const forbidden = /"use client"|useState|useEffect|useRef|onClick|onChange|onSubmit|<form|fetch\(|dangerouslySetInnerHTML/;
    for (const [name, src] of Object.entries({ ...pageSources, pageHeader, statusBadge })) {
      expect(`${name}:${forbidden.test(src)}`).toBe(`${name}:false`);
    }
  });

  it("guards against overflow: min-w-0 on grid children and no fixed pixel widths", () => {
    for (const [name, src] of Object.entries(pageSources)) {
      expect(`${name}:${src.includes("min-w-0")}`).toBe(`${name}:true`);
      expect(/\b(w|min-w)-\[\d+px\]/.test(src)).toBe(false);
    }
  });

  it("stacks on mobile and widens at md and lg", () => {
    expect(journeyPage).toContain("md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]");
    expect(journeyPage).toContain("md:grid-cols-3");
    expect(aboutPage).toContain("sm:grid-cols-2 lg:grid-cols-3");
    expect(journeyPage).toContain("w-full sm:w-auto");
  });

  it("uses theme tokens only, adds no gradients, blur, motion or images", () => {
    const hardcoded = /#[0-9a-fA-F]{3,8}\b|rgba?\(|\b(?:text|bg|border)-(?:white|black|gray|zinc|slate|neutral)/;
    expect(hardcoded.test(allSource)).toBe(false);
    expect(/gradient|blur|animate-|transition|duration-/.test(allSource)).toBe(false);
    expect(/<img|<Image|next\/image/.test(allSource)).toBe(false);
  });

  it("avoids light-theme text-muted on the page background (below AA); uses foreground/70", () => {
    expect(/text-muted\b/.test(allSource)).toBe(false);
  });

  it("sets page metadata and does not override the site-wide indexing setting", () => {
    expect(aboutPage).toContain('title: "About Mingle"');
    expect(journeyPage).toContain('title: "How it works"');
    for (const src of Object.values(pageSources)) expect(/robots\s*:/.test(src)).toBe(false);
    expect(read("app/layout.tsx")).toContain("robots: { index: true, follow: true }");
    expect(read("app/robots.ts")).toContain('allow: "/"');
  });
});
