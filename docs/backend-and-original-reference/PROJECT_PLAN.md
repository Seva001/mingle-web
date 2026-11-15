# Project plan and requirements checklist

Derived from the handoff brief. `[x]` = present in this repo. `[~]` = written but **not yet
verified by running it** (see the note under each phase). Unchecked = **not built**.

## Phase 1: Foundation

Acceptance: responsive pages, theme persistence, accessibility baseline, clean structure.

- [x] Scaffold, folder structure, design tokens (both themes), Light/Dark/System, core components
- [x] Route skeleton for every screen in brief §11
- [x] Public landing page using brief §5 copy, responsive header and footer, nav link test
- [x] `.env.example` (names only), security headers, noindex
- [ ] Private GitHub repo, Vercel preview, Supabase project (need your accounts)

## Phase 2: Authentication and adult eligibility (in progress)

Acceptance (brief §12): secure account flows; adult eligibility controls tested.

- [~] Declared-age check, 18+ (`lib/auth/eligibility.ts`, tests/eligibility.test.ts)
- [~] Fail-closed member-access rule: needs verified email + passed age assurance + active
      status; no bypass flag (`lib/auth/access.ts`, tests/access.test.ts)
- [~] Sign-up / sign-in validation, normalised email, 10–128 char passwords (`lib/validation/auth.ts`)
- [~] Sign-up and sign-in forms with validation, loading and error states; under-18 stops the
      form and sets a 24h deterrent cookie (`lib/auth/actions.ts`, `components/forms/`)
- [~] Verify page explaining the two checks, honest about not being connected
- [~] SQL migration: `accounts`, `account_birth_dates` (adult-only trigger, no member access),
      `verification_records`, RLS, new-user trigger (`supabase/migrations/`) — **never run**
- [ ] Supabase Auth wiring behind `AuthBackend` (`lib/auth/backend.ts` returns null today)
- [ ] Age-assurance provider behind `AgeAssuranceProvider` — **provider not chosen**
- [ ] Server-side session + `decideMemberAccess` gate in `app/(member)/layout.tsx`
- [ ] Email confirmation, password recovery, session management, account deletion
- [ ] Rate limits on sign-up / sign-in
- [ ] RLS tests against a real database; underage-account procedure document

> `[~]` means: pure logic passes 46 checks run under Node with a small vitest stand-in; the
> Next.js build, `tsc`, ESLint, real vitest and the SQL have **not** been run (no network in the
> session that wrote them). Run `npm install && npm run check && npm run build` first.

## Phase 3: Member profile (built on demo data)

Acceptance (brief §12): members can complete, edit and control their profiles.

- [~] Onboarding in 5 steps (about you, photos, intentions + interests, questionnaire,
      preferences); the same screens edit each section via `/onboarding?step=<id>`
- [~] Profile page: photo-led preview card, completion %, per-section edit, visibility switch,
      "clear demo data"
- [~] Photos: type/size checks, resized and re-encoded in the browser (drops EXIF location)
- [~] Optional compatibility questionnaire (8 questions, each says why it is asked)
- [~] Pure logic: validation, completion, untrusted-storage parsing (tests/profile.test.ts)
- [~] SQL migration for profiles, photos, preferences, answers with RLS — **never run**
- [ ] Real persistence: Supabase tables + private photo storage + server-side image checks
- [ ] Server-side validation (today it only runs in the browser)
- [ ] Account deletion removing profile and photos
- [ ] Notification and privacy settings in Settings

> Demo data lives only in this browser's localStorage and is labelled "Demo mode" on every
> member screen. Swap `lib/profile/demo-store.ts` + `use-demo-profile.ts` for Supabase later;
> the screens don't change.

## Phase 4: Discovery (prototype in progress)

- [x] Synthetic-only fixture profiles, clearly labelled in the UI
- [x] Reciprocal age and gender preference filtering in the demo recommendation engine
- [x] Exclusion IDs for passed/liked/blocked records at the engine boundary
- [x] Explainable compatibility calculation using the existing hypothesis weights
- [x] Browser-local demo pass, save and interest actions
- [~] Unit tests written for mutual preferences, age range, hidden profiles, exclusions and scoring (not yet run)
- [ ] Supabase-backed likes, passes, saves and connections
- [ ] Server-side query enforcement and RLS policies
- [ ] Real photo delivery with moderation and private storage
- [ ] Real mutual-interest creation and duplicate/race-condition handling
- [ ] Integration tests with two eligible test accounts

> Current Phase 4 is deliberately a local prototype. A local "Interested" action is not a delivered like and does not create a match. Do not treat this phase as complete or expose real member data until Phase 2/3 backend foundations and safety controls are operational.

## Later phases (brief §12)

5 Messaging, notifications · 6 Reports, moderation, admin, audit · 7 Subscriptions and payments
(after validation) · 8 QA, security, accessibility, beta · 9 Expansion.

## Launch blockers (brief §7, §15), none complete

Age assurance · reporting · blocking · moderation process and staffing · privacy documentation
· account deletion · legal review for the first market · row-level-security tests.
