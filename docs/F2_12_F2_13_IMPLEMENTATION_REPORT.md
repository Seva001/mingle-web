# Implementation report — F2.12 Help page and F2.13 FAQ page

Date: 12 November 2026
Baseline: `Mingle_Frontend_Development_Package_F2_11.zip` (F2.10 About and F2.11 How It Works already applied)
Status: **implemented, statically verified, not runtime verified.** F2.12 and F2.13 are not ticked.

## What was built

| Route | Change |
|---|---|
| `/help` | Placeholder replaced by a grouped Help page: seven topics, a section index, a Contact and support section |
| `/faq` | New page: 21 questions in five categories, accessible accordion |
| Footer | "FAQ" added to the Support group (Help, FAQ, Safety) |

New files: `lib/marketing/support.ts`, `lib/marketing/accordion.ts`, `components/marketing/faq-accordion.tsx`, `app/(marketing)/faq/page.tsx`, `tests/support-pages.test.ts`.
Changed files: `app/(marketing)/help/page.tsx`, `lib/site.ts`, `tests/navigation.test.ts`, `docs/FRONTEND_PROGRESS.md`, `docs/FRONTEND_TASK_BREAKDOWN.md`.

## Task 3 — Help page

- Seven categories: getting started; age and eligibility; profile and compatibility; privacy and your data; accounts and sign-in; safety and respect; availability. Each has a summary, three or four items and related links.
- Navigation to sections: an "On this page" index of in-page links (every topic plus Contact and support, and a link to the FAQ). Wrapped row on mobile, sticky column from `lg`. Works without JavaScript. Sections use `scroll-mt-20`.
- **No support channels invented.** No email, form, chat, phone, hours or response time exists in the repo, so none appears. The page says there is no published way to contact support, and mentions only "local emergency services" generally, with no number. Tests enforce this.
- Links to pages that are placeholders carry the existing "(in progress)" label.

## Task 4 — FAQ page

- Categories: age eligibility, compatibility, privacy, accounts, availability (four or five questions each).
- Accordion follows the WAI-ARIA pattern: real buttons in headings, `aria-expanded`, `aria-controls`, `hidden` answers, Enter and Space (native), Up, Down, Home and End (with wrap), multiple open at once, Expand all and Collapse all, URL hash opens a question.
- Visible focus: the global `:focus-visible` ring, drawn inside each row so it can't be clipped. Tap targets are at least 56px for questions and 44px for index links.
- No motion, no colour-only state, no hard-coded colours, no `text-muted` (below AA on the light background).

## Task 5 — Integration and verification

- **Four pages checked together** (About, How It Works, Help, FAQ): each renders one `h1` through `PageHeader`; all links resolve to existing routes or real ids (including `/how-it-works#eligibility` and `/about#philosophy`); the shared compatibility disclaimer and sensitive-trait exclusion are repeated rather than reworded; all four say Mingle isn't open and has no members. Header unchanged; footer reaches Help, FAQ and Safety.
- **Tests:** `tests/support-pages.test.ts` has 64 tests. All 13 test files: **321 passed, 0 failed** (Node 22, `tsx`, a small Vitest shim). Statements about what works are tied to the source, so stale copy fails a test.
- **Typecheck:** `tsc` 7.0.2, strict, against ambient stubs: 0 real diagnostics. It caught one genuine inference error (`flatMap` over a union of tuples), now fixed.
- **Server render:** both pages rendered with `react-dom/server`. One `h1`, no skipped heading levels, no duplicate ids, every `aria-*` reference and anchor resolves. The FAQ renders 21 collapsed questions with 21 hidden panels.
- **Theme and responsiveness (by code only):** theme tokens only (`bg-surface`, `border-line`, `text-foreground/70`), so dark and light share one implementation. Mobile stacks; the Help index is a wrapped row then a sticky column at `lg`; grids use `minmax(0, …)` and `min-w-0`; no fixed pixel widths; no `overflow-hidden`.

## Outstanding: browser checks

Run each at 320, 375, 768, 1024 and 1440px, in both themes:

1. `/help` and `/faq`: no horizontal scroll; index wraps cleanly; long questions wrap beside the chevron.
2. Help index at `lg`: sticky column sits below the real header, doesn't overlap the footer, and anchor jumps land below the header (`scroll-mt-20`).
3. FAQ with the keyboard only: Tab reaches each question in order; Enter and Space toggle; Up, Down, Home and End move focus and wrap; the focus ring is visible on every question, button and link in both themes.
4. FAQ with a screen reader (VoiceOver, NVDA or TalkBack): each question is announced as a button with expanded or collapsed state; closed answers aren't read; headings list shows h2 and h3 correctly.
5. Hash deep links: `/faq#age-who` opens that question and scrolls to it, both on load and when the hash changes in-page.
6. Expand all and Collapse all work, and focus stays on the pressed button.
7. Zoom to 200 percent and text-only enlargement: nothing clips.
8. `prefers-reduced-motion`: nothing animates (there is no motion).
9. Contrast spot check of `text-foreground/70` on `surface` and `background` in light theme.
10. Browser find-in-page (closed answers aren't searchable; see below).
11. Pages with JavaScript disabled (see below).

## Outstanding: production checks

- Install dependencies, then run `npm run typecheck`, `npm run lint`, `npm test` (real Vitest), `npm run format:check` and `npm run build`. Run Prettier first: a few class strings are long.
- Confirm Tailwind compiles the new classes (`-outline-offset-2`, `lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)]`, `lg:sticky`, `lg:top-24`).
- Confirm the `react-hooks` lint rules accept the hash effect in `faq-accordion.tsx` (it sets state from a `requestAnimationFrame` callback and a `hashchange` listener).
- Check that `/help` and `/faq` stay `noindex` in the production build and are absent from any sitemap.
- **Copy review by the owner and legal counsel** before any public launch: the FAQ describes planned age-check handling, privacy and password rules that aren't built, and the privacy policy, terms and safety pages are still placeholders.
- **Support process:** the Help page is honest only while no channel exists. When a support address or process is chosen, add it in `lib/marketing/support.ts` (`supportStatus`), add Contact to the footer (see the pending note in `lib/site.ts`), and update the tests that currently assert there is none.
- Reconcile the preview's numeric score with the "no score" design, then update the FAQ answer and the test that tracks it.

## Known limitations

- The accordion needs JavaScript; with scripts disabled the answers stay hidden. A `details` fallback or a `noscript` list would fix it.
- Browser find-in-page doesn't open closed answers (`hidden="until-found"` would).
- The header doesn't link to the FAQ (its five links are fixed by F2.1); it is reached from the footer and Help.
