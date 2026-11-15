> **Historical audit — superseded for current source status.** This document describes the earlier frontend-only package dated 12 November 2026. The current source baseline is the Batch H integrated package dated 13 November 2026. Use `docs/audit/PRE_INTEGRATION_AUDIT_2026-11-13.md` and the `HANDOFF/` Batch B–H notes for the current implementation status. This file is retained as historical context only.

# Mingle — Initial Production Audit

Audit date: 12 November 2026  
Source: `mingle-web-production-build-package.zip` (177 ZIP entries; archive integrity test passed)  
Scope: static repository inspection. No Supabase project credentials or live database were available.

## Executive summary

The repository is a useful front-end and domain-logic foundation, but it is not a deployable social product yet. Its own README accurately labels the work as Phase 1 implemented, Phases 2–3 demo/unverified, and Phase 4 discovery prototype. The package contains 127 extracted files. It has no `.git` directory and no installed `node_modules` directory.

The most important finding is that **there is no Supabase SDK integration in the current application**: the account backend returns `null`, the member layout does not enforce a server session or eligibility gate, profile persistence is browser-local, and Discovery uses synthetic fixtures plus browser-local actions. Chats, Connections and Admin are placeholders.

## Severity-ranked findings

### Critical — blocks any real member launch

1. **Authentication is not connected.** `lib/auth/backend.ts` returns `null`; sign-up/sign-in server actions therefore report the backend unavailable. There are no Supabase imports in `app/`, `components/` or `lib/`.
2. **Member routes are not protected server-side.** `app/(member)/layout.tsx` renders `MemberShell` directly. The comment explicitly says the session and adult-eligibility gate is still to be added.
3. **Age assurance is not integrated.** The code has eligibility rules and a DOB validation/cookie gate, but no external age-assurance provider, verified outcome workflow, or live account status lifecycle. A self-entered DOB is not production age assurance.
4. **Profile data is local-only.** Onboarding/profile components use `lib/profile/demo-store.ts` and browser storage. No member profile is persisted to a live database.
5. **Discovery is synthetic and local-only.** `components/discovery/discovery-experience.tsx` imports `DISCOVERY_FIXTURES` and `lib/discovery/demo-store.ts`. It cannot discover real members or create real connections.
6. **Messaging, connections and moderation are not implemented.** Member Chats and Connections pages and `/admin` render placeholders.
7. **Release safety operations are absent.** There is no working report/block/unmatch/moderation workflow, no staff RBAC/audit trail, and no operational escalation process.

### High — required before a controlled beta

1. **Migrations are drafts only.** Two SQL migrations exist, but their comments say they have not been run. No live Supabase project, applied migration history, or cross-user RLS tests were available.
2. **Storage lifecycle is missing.** The schema references private photo paths and moderation states, but there is no storage bucket/policy setup, upload validation, image processing, moderation workflow or signed-URL service.
3. **No integration test environment.** Existing tests are unit tests for pure logic; no two-account Supabase/RLS/storage integration tests are present in the package.
4. **Privacy/legal pages are placeholders.** Terms, Privacy, Safety, Cookies, Help and Community Guidelines currently use `PhasePlaceholder`; they are not complete legal or operational documents.
5. **International activation controls are not implemented.** Country allowlisting, locale catalogs, timezone handling and market-specific launch gates are not established.
6. **No Git repository metadata.** The extracted package has no `.git` directory. It must be initialized or connected to the intended remote when on the PC; preserve a backup first.

### Medium — engineering verification and polish

1. `npm ci --ignore-scripts --no-audit --no-fund` did not complete within the available 120-second execution window. Consequently, dependency installation, typecheck, lint, unit tests and production build have **not been verified in this audit**.
2. Runtime versions detected: Node `v22.16.0`, npm `10.9.2`. The lockfile declares Next.js `16.4.6` and React `19.3.1`; compatibility still needs to be confirmed by a successful install and build.
3. The package includes `.env.example` with planned variable names only. No real credentials were present (which is correct); environment validation and provider wiring remain future work.

## Existing foundation that should be preserved

- Next.js App Router, TypeScript, Tailwind CSS v4 and React application structure.
- Marketing pages, authentication UI, member shell/navigation and reusable UI components.
- Mingle design tokens, themes and responsive styling.
- Pure eligibility/access decision logic and input validation.
- Profile field validation, sanitisation, completion and photo helper logic.
- Compatibility weights, scoring and explainability logic.
- Discovery candidate types, fixture-based UI and local interaction model (keep fixtures isolated to development/tests only).
- Two initial SQL migrations for accounts/eligibility and member profiles/preferences/answers/photos.
- Unit tests for access, eligibility, profile, compatibility, discovery, navigation, theme and validation.

## Baseline command results

| Check | Result |
|---|---|
| ZIP integrity (`ZipFile.testzip`) | Passed; returned `None` |
| Extracted file count | 127 files |
| Node version | `v22.16.0` |
| npm version | `10.9.2` |
| Git status | Not available; extracted folder is not a Git repository |
| `node_modules` | Absent |
| `npm ci --ignore-scripts --no-audit --no-fund` | Timed out after 120 seconds |
| Typecheck / lint / tests / build | Not run; dependencies unavailable |
| Supabase migrations / RLS | Not applied or integration-tested |

## Recommended implementation order

1. **Batch B — Supabase foundation and server-side route protection.** Add supported Supabase SSR clients, strict environment validation, cookie/session lifecycle, server-side member gate and fail-closed eligibility checks. Keep the app unavailable for member use until a real age-assurance outcome is verified. Add tests for anonymous, unverified, pending, failed and eligible states.
2. **Batch C — persisted profiles and preferences.** Replace demo profile persistence with authenticated database operations; add storage bucket policies and private photo lifecycle; validate with two accounts and RLS tests.
3. **Batch D — real Discovery.** Server-side candidate retrieval, symmetric preference checks, blocks, safe profile projection, cursor pagination, idempotent interest actions and atomic connection creation. Remove fixtures from production paths.
4. **Batch E — Safety and operations.** Report/block/unmatch, moderator/admin roles, audit logs, account deletion and retention workflows.
5. **Batch F — international readiness.** Locale infrastructure, country allowlist, timezone and coarse-location handling.
6. **Batch G — Messaging.** Only after a valid connection exists; enforce membership authorization and block/unmatch behavior.
7. **Batch H — release hardening.** Cross-account security/RLS tests, accessibility, performance, monitoring, backup/restore, legal review, support and staged release.

## Decisions/credentials that will eventually be needed

- A Supabase project (local/staging first, production separate) and its URL + publishable key.
- A real age-assurance provider/process suitable for the first launch country. Do not substitute a DOB checkbox or fabricated pass result.
- A transactional email provider and verified sender/domain for auth messages.
- A first launch country/market, with legal/privacy and moderation readiness review.
- A staffed moderation/support owner and incident escalation procedure.

No secrets should be pasted into chat or committed to Git. Use local environment files and the deployment provider's secret manager.

## Proposed next batch

Proceed with **Batch B in small implementation slices**, beginning with dependency/version verification and Supabase SSR/environment scaffolding. Build the age-assurance provider boundary so it fails closed; do not pretend verification is complete without a real provider. Then protect member routes server-side before enabling profile or discovery data.

## Launch status

**NOT LAUNCH-READY.** The project must not be publicly launched or indexable until all release gates in `PRODUCTION_BUILD_PACKAGE.md` are met and the owner explicitly approves release.
