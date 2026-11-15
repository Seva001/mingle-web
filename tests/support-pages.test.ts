import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACCORDION_NAV_KEYS,
  allIds,
  idFromHash,
  nextTriggerIndex,
  toggleId,
  withId,
} from "@/lib/marketing/accordion";
import { compatibility } from "@/lib/marketing/landing";
import { journeyStages } from "@/lib/marketing/pages";
import { faq, faqItems, help, supportStatus, type HelpTopic } from "@/lib/marketing/support";
import { footerGroups } from "@/lib/site";
import { MAX_PHOTOS } from "@/lib/profile/options";

const root = new URL("..", import.meta.url).pathname;
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "");

const helpPage = read("app/(marketing)/help/page.tsx");
const faqPage = read("app/(marketing)/faq/page.tsx");
const accordion = read("components/marketing/faq-accordion.tsx");
const accordionCode = stripComments(accordion);
const supportData = read("lib/marketing/support.ts");

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}
const helpCopy = strings({ help, supportStatus }).join("\n");
const faqCopy = strings(faq).join("\n");
const allCopy = `${helpCopy}\n${faqCopy}`;

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

describe("help page: structure (F2.12)", () => {
  it("groups guidance into the required topics", () => {
    const ids = help.topics.map((t) => t.id);
    for (const id of [
      "getting-started",
      "age-and-eligibility",
      "profile-and-compatibility",
      "privacy-and-your-data",
      "accounts-and-sign-in",
      "safety-and-respect",
      "availability",
    ]) {
      expect(ids).toContain(id);
    }
  });

  it("gives every topic a title, a summary and several items with text", () => {
    for (const topic of help.topics) {
      expect(topic.title.length > 0 && topic.summary.length > 0).toBe(true);
      expect(topic.items.length >= 3).toBe(true);
      for (const item of topic.items) expect(item.title.length > 0 && item.body.length > 0).toBe(true);
    }
  });

  it("uses unique ids that don't clash with the support section", () => {
    const ids = [...help.topics.map((t) => t.id), supportStatus.id];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("builds its section index from the same data, so every topic is reachable", () => {
    expect(helpPage).toContain("topics.map((t) => ({ id: t.id, title: t.title }))");
    expect(helpPage).toContain("supportStatus.id");
    expect(helpPage).toContain("href={`#${section.id}`}");
    expect(helpPage).toContain("id={topic.id}");
    expect(helpPage).toContain("scroll-mt-20");
  });

  it("labels the index as navigation and the sections as labelled regions", () => {
    expect(helpPage).toContain('<nav aria-labelledby="help-nav-title"');
    expect(helpPage).toContain('id="help-nav-title"');
    expect(helpPage).toContain("aria-labelledby={`${topic.id}-title`}");
    expect(helpPage).toContain("id={`${topic.id}-title`}");
  });

  it("renders one h1 through PageHeader, h2 per section and h3 per item, skipping no level", () => {
    expect(/<h1/.test(helpPage)).toBe(false);
    expect(helpPage).toContain("<PageHeader");
    expect((helpPage.match(/<h2/g) ?? []).length).toBe(2);
    expect(helpPage).toContain("<h3");
    expect(/<h[456]/.test(helpPage)).toBe(false);
  });

  it("states that the page covers what exists today, and that Mingle isn't open", () => {
    expect(help.status.body).toContain("isn’t open yet");
    expect(help.status.body).toContain("there are no members");
  });
});

describe("help page: no invented support channels (F2.12)", () => {
  it("says plainly that no support contact is published yet", () => {
    expect(supportStatus.lead).toContain("doesn’t have a published way to contact support");
    expect(supportStatus.body).toContain("no support service to reach");
  });

  it("contains no email address, phone number, URL or social handle", () => {
    expect(/[\w.+-]+@[\w-]+\.[\w.]+/.test(allCopy)).toBe(false);
    expect(/https?:\/\/|www\./i.test(allCopy)).toBe(false);
    expect(/\+?\d[\d\s().-]{6,}\d/.test(allCopy)).toBe(false);
    expect(/(^|\s)@\w+/.test(allCopy)).toBe(false);
  });

  it("promises no live chat, ticket, call-back, help desk, hours or response time", () => {
    const channel =
      /live chat|chat with|chatbot|support team|help ?desk|ticket|call us|phone|hotline|helpline|email us|contact us|write to us|reply within|respond within|within \w+ (hours?|days?)|business hours|24\/7|we(’ll| will) (reply|respond|get back)/i;
    expect(channel.test(allCopy)).toBe(false);
  });

  it("keeps Help and FAQ free of contact forms while Contact is a separate preview route", () => {
    for (const src of [helpPage, faqPage]) {
      expect(/mailto:|tel:|<form|<input|<textarea|href="\/contact"/.test(src)).toBe(false);
    }
    expect(footerGroups.flatMap((g) => g.links).some((l) => l.label === "Contact")).toBe(true);
    expect(routes.has("/contact")).toBe(true);
    expect(read("components/forms/contact-form.tsx")).toContain("no message can be delivered");
  });

  it("only points to emergency services in general terms, with no number", () => {
    expect(supportStatus.emergency).toContain("local emergency services");
    expect(supportStatus.emergency).toContain("can’t respond to emergencies");
  });
});

describe("faq page: content (F2.13)", () => {
  it("covers age eligibility, compatibility, privacy, accounts and availability", () => {
    expect(faq.categories.map((c) => c.id)).toEqual([
      "age",
      "compatibility",
      "privacy",
      "accounts",
      "availability",
    ]);
  });

  it("gives every category several questions, each with a question and at least one answer", () => {
    for (const category of faq.categories) {
      expect(category.items.length >= 4).toBe(true);
      for (const item of category.items) {
        expect(item.question.endsWith("?")).toBe(true);
        expect(item.answer.length >= 1 && item.answer.every((p) => p.length > 0)).toBe(true);
      }
    }
  });

  it("uses unique ids for categories and questions, so aria ids and deep links can't collide", () => {
    const ids = [...faq.categories.map((c) => c.id), ...faqItems.map((i) => i.id)];
    expect(new Set(ids).size).toBe(ids.length);
    expect(faqItems.length).toBe(faq.categories.reduce((n, c) => n + c.items.length, 0));
  });

  it("answers the age questions: adults only, a typed date isn't proof, the cookie is a deterrent", () => {
    const age = Object.fromEntries(faqItems.map((i) => [i.id, i.answer.join(" ")]));
    expect(age["age-who"]).toContain("adults aged 18 and over");
    expect(age["age-proof"]).toContain("isn’t proof of age");
    expect(age["age-under-18"]).toContain("only a deterrent");
  });

  it("repeats the shared compatibility disclaimer and exclusion rather than contradicting them", () => {
    const text = Object.fromEntries(faqItems.map((i) => [i.id, i.answer.join(" ")]));
    expect(text["compat-guarantee"]).toContain("can’t guarantee a match or a relationship");
    expect(text["compat-score"]).toContain("You won’t see a compatibility percentage or score");
    expect(compatibility.disclaimer).toContain("You won’t see a compatibility percentage or score");
    expect(text["compat-sensitive"]).toContain(compatibility.excluded.replace(/\.$/, ""));
  });

  it("says Mingle isn't open and sign-up can't create an account", () => {
    const text = Object.fromEntries(faqItems.map((i) => [i.id, i.answer.join(" ")]));
    expect(text["avail-open"]).toContain("Accounts aren’t available and there are no members");
    expect(text["accounts-create"]).toContain("can’t create an account");
  });

  it("invents no statistics, testimonials, dates or history", () => {
    expect(allCopy.replace(/\b18\b/g, "").match(/\d/g)).toBe(null);
    expect(allCopy.includes("%") && !allCopy.includes("compatibility percentage")).toBe(false);
    expect(/testimonial|success stor|thousands|millions|\bcouples?\b|\bmembers? (have|say|love)\b|trusted by|launched in|founded/i.test(allCopy)).toBe(false);
  });

  it("makes no overclaim, guarantee or safety promise", () => {
    const overclaim =
      /scientific|proven|proves|algorithm|perfect|soulmate|find love|100%|\bbest\b|guaranteed|\balways\b|\bnever\b|\b(safe|safest|secure|protected)\b|fully verified|24\/7|predict(s|ive)? (love|success)/i;
    expect(overclaim.test(allCopy)).toBe(false);
  });

  it("does not describe unfinished features as live", () => {
    const live = /\b(now live|available now|live now|is live|are live|today you can|already (works|open))\b/i;
    expect(live.test(allCopy)).toBe(false);
  });

  it("names religion, ethnicity, politics and health only through the shared exclusion sentence", () => {
    const sensitive = /religio|politic|ethnic|health|race\b|sexual orientation|disabilit/i;
    const exclusion = compatibility.excluded.replace(/\.$/, "");
    const list = "religion, ethnicity, politics or health";
    // The only mentions allowed are the shared exclusion sentence and the FAQ question that asks about it.
    expect(sensitive.test(allCopy.split(exclusion).join("").split(list).join(""))).toBe(false);
    expect(faqItems.find((i) => i.id === "compat-sensitive")!.question).toContain(list);
  });
});

describe("help and faq: statements match the source (F2.12, F2.13)", () => {
  // Each assertion ties a sentence to the code behind it. When the code changes, the sentence is
  // out of date and the test fails as a prompt to revisit the copy.

  it("sign-up asks for no email code and no separate age-check page exists", () => {
    expect(existsSync(join(process.cwd(), "app/(auth)/verify/page.tsx"))).toBe(false);
    expect(read("components/forms/sign-up-form.tsx")).toContain("There is no email code to enter");
  });

  it("no age-assurance provider exists, and the copy says ages are not checked against ID", () => {
    expect(existsSync(join(process.cwd(), "lib/auth/age-assurance.ts"))).toBe(false);
    expect(/does not check it against ID/i.test(allCopy)).toBe(true);
    expect(/age[- ](check|assurance)s? (is|are) required/i.test(allCopy)).toBe(false);
  });

  it("an under-18 attempt stores nothing but sets a retry-blocking cookie", () => {
    const actions = read("lib/auth/actions.ts");
    expect(actions).toContain("Nothing about the attempt is stored");
    expect(actions).toContain("jar.set(AGE_GATE_COOKIE");
  });

  it("the password rule is ten characters minimum, with no composition rules", () => {
    expect(read("lib/validation/auth.ts")).toMatch(/10/);
    expect(read("docs/DECISIONS.md")).toContain("10–128 characters, no composition rules");
    expect(faqItems.find((i) => i.id === "accounts-password")!.answer.join(" ")).toContain("At least ten characters");
  });

  it("sign-up doesn't reveal whether an email is registered (documented decision)", () => {
    expect(read("docs/DECISIONS.md")).toContain("Sign-up never reveals whether an email is registered");
  });

  it("preview photos are re-encoded in the browser and not uploaded", () => {
    const photo = read("lib/profile/photo.ts");
    expect(photo).toContain("re-encodes as JPEG");
    expect(photo).toContain("EXIF");
    expect(MAX_PHOTOS).toBe(6);
  });

  it("legacy demo storage remains isolated while profile visibility is persisted", () => {
    expect(read("lib/profile/demo-store.ts")).toMatch(/localStorage/);
    expect(read("components/profile/profile-overview.tsx")).toContain("setMyProfileVisibilityAction");
    expect(read("components/profile/profile-overview.tsx")).toContain("setVisibility");
    expect(read("lib/discovery/engine.ts")).toContain('member.visibility !== "visible"');
  });

  it("the preview still renders a numeric score, so the FAQ's admission is true (reconcile, then update the FAQ)", () => {
    expect(read("components/discovery/discovery-experience.tsx")).toMatch(/\{compatibility\.score\}<span[^>]*>\/100/);
  });

  it("blocking, reporting and moderation remain local previews without backend enforcement", () => {
    expect(read("components/admin/admin-overview.tsx")).toContain("not a protected admin console");
    expect(read("components/safety/report-form.tsx")).toContain("has not been sent or stored");
    expect(read("components/discovery/discovery-experience.tsx")).toContain("local demo discovery only");
  });

  it("legal and safety pages explain their draft or unavailable status", () => {
    expect(read("components/marketing/legal-document.tsx")).toContain("Draft — not a published legal policy");
    expect(read("app/(marketing)/safety/page.tsx")).toContain("not transmitted, stored or reviewed yet");
    expect(read("app/(marketing)/community-guidelines/page.tsx")).toContain("moderation, evidence handling, appeals");
  });
});

describe("help and faq: links and navigation (F2.12, F2.13)", () => {
  const helpLinks = [
    ...(help.topics as readonly HelpTopic[]).flatMap((t) => t.links ?? []),
    help.faqLink,
    faq.more.link,
  ];
  const stageKeys = journeyStages.map((s) => s.key as string);
  const aboutIds = ["purpose", "philosophy", "audience", "direction"];

  it("/help and /faq are real pages and Help no longer uses the placeholder", () => {
    expect(routes.has("/help")).toBe(true);
    expect(routes.has("/faq")).toBe(true);
    expect(helpPage.includes("PhasePlaceholder")).toBe(false);
  });

  it("every link resolves to an existing route, and anchors resolve to real ids", () => {
    for (const link of helpLinks) {
      const [path, hash] = link.href.split("#");
      expect(routes.has(path || "/")).toBe(true);
      if (path === "/how-it-works" && hash) expect(stageKeys).toContain(hash);
      if (path === "/about" && hash) expect(aboutIds).toContain(hash);
    }
  });

  it("labels links to unpublished pages as in progress", () => {
    for (const link of helpLinks.filter((l) => ["/privacy", "/cookies", "/safety", "/community-guidelines"].includes(l.href))) {
      expect(link.label).toContain("(in progress)");
    }
  });

  it("the footer links to the FAQ, and the header keeps its five required links", () => {
    expect(footerGroups.find((g) => g.title === "Support")!.links.map((l) => l.href)).toContain("/faq");
    expect(read("lib/site.ts")).toContain('{ label: "Safety", href: "/safety" },\n];');
  });

  it("Help and the FAQ link to each other", () => {
    expect(help.faqLink.href).toBe("/faq");
    expect(faq.more.link.href).toBe("/help");
  });

  it("keeps the site-wide indexing setting and sets page titles", () => {
    expect(helpPage).toContain('title: "Help"');
    expect(faqPage).toContain('title: "FAQ"');
    for (const src of [helpPage, faqPage]) expect(/robots\s*:/.test(src)).toBe(false);
    expect(read("app/layout.tsx")).toContain("robots: { index: true, follow: true }");
  });

  it("FAQ page renders one h1 through PageHeader, and the accordion owns the h2 and h3 levels", () => {
    expect(/<h1/.test(faqPage)).toBe(false);
    expect(faqPage).toContain("<PageHeader");
    expect(accordionCode).toContain("<h2");
    expect(accordionCode).toContain("<h3");
    expect(/<h[456]/.test(accordionCode)).toBe(false);
  });

  it("the FAQ's category index links to the section ids the accordion renders", () => {
    expect(faqPage).toContain("href={`#${category.id}`}");
    expect(accordionCode).toContain("id={category.id}");
    expect(faqPage).toContain('aria-label="FAQ topics"');
  });
});

describe("faq accordion: accessibility (F2.13)", () => {
  it("is a client component, and the pages around it stay server components", () => {
    expect(accordion.startsWith('"use client";')).toBe(true);
    for (const src of [helpPage, faqPage]) {
      expect(/"use client"|useState|useEffect|onClick|onChange/.test(src)).toBe(false);
    }
  });

  it("uses real buttons inside headings, not clickable divs", () => {
    expect(accordionCode).toMatch(/<h3[^>]*>\s*<button/);
    expect(accordionCode).toContain('type="button"');
    expect(/<(div|span|li)[^>]*onClick/.test(accordionCode)).toBe(false);
    expect(/role="button"|tabIndex/.test(accordionCode)).toBe(false);
  });

  it("wires aria-expanded and aria-controls, and the panel is hidden while closed", () => {
    expect(accordionCode).toContain("aria-expanded={isOpen}");
    expect(accordionCode).toContain("aria-controls={panelId}");
    expect(accordionCode).toContain("id={panelId}");
    expect(accordionCode).toContain("hidden={!isOpen}");
    expect(accordionCode).toContain("const panelId = `${item.id}-panel`");
  });

  it("does not add a landmark per answer", () => {
    expect(accordionCode.includes('role="region"')).toBe(false);
  });

  it("toggles with Enter and Space through the native button, with no key handler overriding them", () => {
    expect(accordionCode).not.toMatch(/key === ["'](Enter| )["']/);
    expect(accordionCode).not.toMatch(/event\.key === ["']Enter/);
    expect(accordionCode).toContain("onClick={() => setOpen((current) => toggleId(current, item.id))}");
  });

  it("moves focus with the arrow keys, Home and End, ignoring modified keys", () => {
    expect(accordionCode).toContain("nextTriggerIndex(");
    expect(accordionCode).toContain("event.preventDefault()");
    expect(accordionCode).toContain("triggers[next]?.focus()");
    expect(accordionCode).toContain("event.altKey || event.ctrlKey || event.metaKey || event.shiftKey");
    expect(accordionCode).toContain('data-faq-trigger=""');
  });

  it("keeps the visible focus ring and never removes it", () => {
    const css = read("styles/globals.css");
    expect(css).toContain(":focus-visible");
    expect(css).toContain("outline: 2px solid var(--focus)");
    expect(/outline-none|outline-0|focus:outline-none|ring-0/.test(accordionCode + helpPage + faqPage)).toBe(false);
    expect(accordionCode).toContain("focus-visible:-outline-offset-2");
  });

  it("draws the focus ring inside the row, so no parent can clip it", () => {
    expect(/overflow-hidden/.test(accordionCode + helpPage + faqPage)).toBe(false);
  });

  it("gives the controls a 44px tap target or more", () => {
    expect(accordionCode).toContain("min-h-14");
    expect(helpPage).toContain("min-h-11");
    expect(faqPage).toContain("min-h-11");
    expect(accordionCode).toContain('size="sm"'); // h-9 text buttons, kept as the quiet secondary controls
  });

  it("shows open and closed by the chevron and aria-expanded, not by colour alone", () => {
    expect(accordionCode).toContain("rotate-180");
    expect(accordionCode).toContain('aria-hidden');
    expect(accordionCode).toContain("ChevronDown");
  });

  it("has Expand all and Collapse all as labelled buttons from the data", () => {
    expect(faq.controls).toEqual({ expand: "Expand all", collapse: "Collapse all" });
    expect(accordionCode).toContain("{controls.expand}");
    expect(accordionCode).toContain("{controls.collapse}");
  });

  it("opens a question named by the URL hash, and listens for later hash changes", () => {
    expect(accordionCode).toContain("idFromHash(window.location.hash, ids)");
    expect(accordionCode).toContain('addEventListener("hashchange"');
    expect(accordionCode).toContain('removeEventListener("hashchange"');
    expect(accordionCode).toContain("cancelAnimationFrame(frame)");
  });

  it("matches the heading id to the question id, so the native anchor jump lands on it", () => {
    expect(accordionCode).toContain("<h3 id={item.id}");
  });

  it("adds no motion, gradients, images or hard-coded colours, and avoids text-muted", () => {
    const code = [accordionCode, stripComments(helpPage), stripComments(faqPage)].join("\n");
    expect(/gradient|blur|animate-|transition|duration-/.test(code)).toBe(false);
    expect(/<img|<Image|next\/image/.test(code)).toBe(false);
    expect(/#[0-9a-fA-F]{3,8}\b|rgba?\(|\b(?:text|bg|border)-(?:white|black|gray|zinc|slate|neutral)/.test(code)).toBe(false);
    expect(/text-muted\b/.test(code)).toBe(false);
  });

  it("guards against overflow: min-w-0 on flex and grid children, minmax tracks, no fixed pixel widths", () => {
    for (const src of [helpPage, accordionCode]) {
      expect(src).toContain("min-w-0");
      expect(/\b(w|min-w)-\[\d+px\]/.test(src)).toBe(false);
    }
    expect(helpPage).toContain("lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)]");
    expect(helpPage).toContain("flex-wrap");
    expect(faqPage).toContain("flex-wrap");
  });

  it("stacks on mobile: the Help index is a wrapped row, then a sticky column from lg", () => {
    expect(helpPage).toContain("flex flex-wrap gap-2 lg:flex-col");
    expect(helpPage).toContain("lg:sticky");
  });
});

describe("faq accordion: logic", () => {
  it("moves down, up, home and end, wrapping at both ends", () => {
    expect(nextTriggerIndex("ArrowDown", 0, 3)).toBe(1);
    expect(nextTriggerIndex("ArrowDown", 2, 3)).toBe(0);
    expect(nextTriggerIndex("ArrowUp", 1, 3)).toBe(0);
    expect(nextTriggerIndex("ArrowUp", 0, 3)).toBe(2);
    expect(nextTriggerIndex("Home", 2, 3)).toBe(0);
    expect(nextTriggerIndex("End", 0, 3)).toBe(2);
  });

  it("ignores other keys, an empty list and focus that isn't on a header", () => {
    for (const key of ["Enter", " ", "Tab", "Escape", "ArrowLeft", "ArrowRight", "a"]) {
      expect(nextTriggerIndex(key, 1, 3)).toBe(null);
    }
    expect(nextTriggerIndex("ArrowDown", 0, 0)).toBe(null);
    expect(nextTriggerIndex("ArrowDown", -1, 3)).toBe(null);
    expect(nextTriggerIndex("ArrowDown", 3, 3)).toBe(null);
    expect([...ACCORDION_NAV_KEYS].sort()).toEqual(["ArrowDown", "ArrowUp", "End", "Home"]);
  });

  it("toggles without mutating, and several can be open at once", () => {
    const empty = new Set<string>();
    const one = toggleId(empty, "a");
    const two = toggleId(one, "b");
    expect([...empty]).toEqual([]);
    expect([...one]).toEqual(["a"]);
    expect([...two].sort()).toEqual(["a", "b"]);
    expect([...toggleId(two, "a")]).toEqual(["b"]);
  });

  it("withId adds once and returns the same set when nothing changes", () => {
    const open = new Set(["a"]);
    expect(withId(open, "a")).toBe(open);
    expect([...withId(open, "b")].sort()).toEqual(["a", "b"]);
    expect([...open]).toEqual(["a"]);
  });

  it("expands and collapses all", () => {
    const ids = faqItems.map((i) => i.id);
    expect(allIds(ids, true).size).toBe(ids.length);
    expect(allIds(ids, false).size).toBe(0);
  });

  it("reads only known question ids from a URL hash", () => {
    const ids = faqItems.map((i) => i.id);
    expect(idFromHash("#age-who", ids)).toBe("age-who");
    expect(idFromHash("age-who", ids)).toBe("age-who");
    expect(idFromHash("#age", ids)).toBe(null); // a category, not a question
    expect(idFromHash("#nope", ids)).toBe(null);
    expect(idFromHash("", ids)).toBe(null);
    expect(idFromHash("#%E0%A4%A", ids)).toBe(null); // malformed escape: no throw
  });

  it("every FAQ question is reachable by the keyboard order and by hash", () => {
    const ids = faqItems.map((i) => i.id);
    for (const id of ids) expect(idFromHash(`#${id}`, ids)).toBe(id);
    let index = 0;
    for (let i = 0; i < ids.length; i += 1) index = nextTriggerIndex("ArrowDown", index, ids.length)!;
    expect(index).toBe(0);
  });
});

describe("support data: tone", () => {
  it("writes the support data as plain data with no JSX or imports of components", () => {
    expect(/<[A-Z]|from "@\/components/.test(supportData.replace(/\/\*[\s\S]*?\*\//g, ""))).toBe(false);
  });
});
