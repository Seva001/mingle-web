# mingle-web

Mingle: a compatibility-first connection platform for adults 18+. Responsive web app first.
Source of truth: the **Mingle Product Strategy & Build Handoff Brief v1.0** (9 Nov 2026).

> **Status: Phase 1 implemented; Phase 2 and Phase 3 remain demo / unverified; Phase 4 discovery prototype in progress.** Design system, theming and public pages exist. Supabase Auth, real age assurance, server-side member gating and database migrations are not connected or verified. Phase 3 profile data is stored in this browser only. Phase 4 includes synthetic-fixture recommendations and local-only pass/save/interest actions; it does not connect real members or create mutual connections. Messaging and admin are not built. Nothing here is launch-ready and the site remains `noindex` / `Disallow: /` on purpose.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000   (design system at /design-system)
npm run check        # typecheck + lint + tests
npm run build
```

Node 22+. No environment variables are needed yet (see `.env.example`).

## Layout

```
app/
  (marketing)/   public site: home, how-it-works, safety, pricing
  (auth)/        sign-in, sign-up, verify
  (member)/      discover, connections, chats, profile, settings (+ app shell)
  (dev)/         design-system (local + preview only; 404 in production)
  admin/         moderation and operations (Phase 6)
components/      ui/ (primitives) layout/ navigation/ discovery/ profile/ messaging/ forms/
lib/             theme.ts, utils.ts, compatibility/, supabase/, auth/, validation/, security/
styles/          themes.css (tokens, both themes) + globals.css (Tailwind v4 mapping)
supabase/        migrations/ functions/
tests/           vitest: foundation, profile, eligibility and discovery logic
docs/            PROJECT_PLAN.md, DESIGN_SYSTEM.md, DECISIONS.md
```

## Docs

- `docs/PROJECT_PLAN.md`: requirements checklist, phase plan, acceptance criteria
- `docs/DESIGN_SYSTEM.md`: tokens, themes, components, accessibility rules
- `docs/DECISIONS.md`: defaults chosen, deviations from the brief, open items
- `docs/PHASE_4_CLAUDE_WORKFLOW.md`: controlled Claude build batches, guardrails and recovery prompt

## Production implementation package

Read `docs/PRODUCTION_BUILD_PACKAGE.md` and `docs/CLAUDE_MASTER_EXECUTION_PROMPT.md` before continuing with Claude Code. The current Discovery UI is a local demonstration, not a live member system. Replace it only after session, adult-eligibility, profile persistence, RLS and integration tests are in place.
