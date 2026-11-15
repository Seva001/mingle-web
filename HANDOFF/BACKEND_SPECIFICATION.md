# Mingle — Complete Backend & Production Completion Specification
Version 1.0 | 13 November 2026

## 1. Product contract
Mingle is a compatibility-first social connection platform for adults only. It is intended for an international audience, but must launch through a controlled country/market allowlist. Continue from the existing Next.js frontend; do not rebuild or redesign it.

**Design preservation:** keep the existing UI, typography, layout, components, theme tokens and responsive patterns. Extend existing screens to connect real services. Do not introduce fake profiles, fake activity, fabricated counts, fake matches or simulated success states.

**Safety baseline:** self-entered date of birth is not age assurance. Member access remains closed until the account has confirmed email and a valid, provider-backed age-assurance result, plus any market-specific age-of-majority rule. No bypass or development shortcut may reach production.

## 2. Current state — do not overclaim
The supplied Pass 3 frontend contains marketing/public pages, authentication UI, member shell, profile/onboarding surfaces, discovery UI, messaging and notification previews, safety/report UI and admin workspace. Batch B–G implementation source has since been integrated; no migration has been applied to a live Supabase project. Pass 3's report records 28 routes, 134 TS/TSX files scanned, no syntax errors and no missing local imports in its static scan.

**Not verified:** dependency installation, full TypeScript typecheck, ESLint, Vitest, Prettier, production build, browser/device behaviour, accessibility, or live Supabase integration. No Supabase project has been created. Messaging and notifications still use preview/sample data or local component state. Discovery, reporting, moderation and admin operations now have backend source integrations but are not verified against a live database.

The source includes Batch B–G backend implementation passes, not certified completed/production-ready functionality.

## 3. Architecture
- Web: Next.js App Router, React, TypeScript strict, Tailwind CSS v4.
- Backend: Supabase Auth, PostgreSQL, Row Level Security (RLS), Storage; Realtime only where justified.
- Hosting: Vercel or equivalent.
- Server Components by default for authenticated reads; Client Components only for interaction.
- All member-data reads/writes go through authenticated server code (Server Actions, Route Handlers or narrowly scoped SQL RPCs).
- Derive member identity from the verified server session. Never trust a client-supplied user ID, role, DOB, age flag, verification status, country eligibility or compatibility score.
- Apply versioned SQL migrations from the repository; no undocumented dashboard-only schema changes.
- Keep local/staging/production Supabase projects separate.

## 4. Batch roadmap and acceptance criteria

### Batch B — Supabase foundation, authentication and route protection
1. Create `mingle-dev` Supabase project.
2. Install `@supabase/supabase-js` and `@supabase/ssr` after confirming compatibility with Next.js 16.
3. Add typed environment validation and separate browser/server Supabase clients.
4. Implement cookie-aware session refresh using the Next.js 16 `proxy.ts` convention after verifying current framework guidance.
5. Connect existing sign-up, login, logout, email verification, resend and password recovery screens.
6. Keep generic auth errors to reduce account enumeration.
7. Add server-side member route guard and server-side data authorization.
8. Correct draft account migration: active status must require confirmed email AND passed age assurance AND permitted market AND no suspension/block. Only trusted server/provider callback or restricted database function may transition status.
9. Keep age assurance provider boundary closed until a real provider is chosen and integrated.
10. Add auth/access tests.

**Acceptance:** anonymous, email-unconfirmed, age-unverified, failed, suspended and blocked accounts cannot read member pages or data. Eligible status is derived from trusted server-side records. No privileged secret reaches browser bundles.

### Batch C — Persisted profiles, preferences and private photos
Replace browser demo stores with authenticated database persistence. Store minimum necessary profile fields. Keep DOB in restricted table; never return it to other members. Store questionnaire answers privately and version them. Use a private Storage bucket for photos; validate MIME, extension, file signature, dimensions and size server-side; re-encode images; strip EXIF/GPS; quarantine pending moderation; issue short-lived signed URLs only. Only authorized moderators can approve/reject. Enforce RLS and ownership checks.

**Acceptance:** two test accounts cannot read/write each other's private profile fields, answers or photo objects.

### Batch D — Real discovery and connections
Candidate retrieval is server-side and paginated with opaque cursors. Apply mutual preferences, market eligibility, active status, blocks, visibility, moderation and age rules in every query. Return a safe public profile projection only. Compatibility scores are versioned and explainable; do not use sensitive traits or protected categories. Implement idempotent pass/save/interest actions with uniqueness constraints and rate limits. Reciprocal interest creates exactly one canonical connection in a transaction after rechecking both accounts, preferences and blocks. Never expose pass history, private answers, precise location or internal risk flags. Fixtures must never be imported in production paths.

**Acceptance:** two real accounts can discover only mutually eligible profiles; reciprocal interest creates one connection even under concurrent/replayed requests; no private fields leak.

### Batch E — Safety, moderation and administration
Implement member report/block/unmatch actions; immediate block enforcement in discovery, connection and messaging authorization; moderator/admin roles enforced server-side; separate capabilities; moderation queues and minimized evidence; append-only audit events for privileged actions; account suspension, deletion, retention and data export workflows; rate limits, abuse/spam controls and incident runbooks. Admin UI must be inaccessible without server-verified staff authorization.

**Acceptance:** members cannot query reports or moderation notes; staff actions are permission-checked and audited; blocks take effect immediately.

### Batch F — International readiness
Implement launch-country allowlist and market configuration, per-country age-of-majority rules and age-assurance requirements reviewed by counsel, locale/timezone formatting (store timestamps in UTC), coarse location only, country-specific privacy/consent/retention rules. Start with one deliberately chosen launch market; do not automatically enable every country.

**Acceptance:** only enabled markets can register/use member features; localized dates and policy rules work.

### Batch F source implementation note

Batch F adds `20261110000005_international_readiness.sql`, enabled-market signup, per-market age thresholds, consent-version records, locale/timezone preferences, market-derived profile country and same-market discovery by default. No market is seeded or enabled; the initial launch market and policy values require explicit owner/legal review. See `BATCH_F_IMPLEMENTATION_NOTES.md` for limitations and verification status.

### Batch G — Messaging and notifications
Messaging is available only to members of a valid connection. Verify conversation membership on every read, send, attachment and realtime subscription. Persist messages with cursor pagination. Rate-limit sends; enforce block/unmatch policy; support report flows. Add notification preferences and delivery queue after selecting/configuring a transactional email provider. Push notifications are later optional work. Never allow a client to subscribe to another user's private channel.

**Acceptance:** only connection members can read/send; blocks/unmatches revoke access according to policy; message and notification authorization tests pass.

### Batch H — Release hardening
Complete automated unit, integration, RLS, storage, end-to-end and accessibility tests; dependency/security audit; headers, CSRF/origin checks where relevant, input validation and rate limits; monitoring/error tracking/logging without sensitive payloads/alerting; backups and tested restore; incident response and rollback; legal documents, support process and staffed moderation; staging deployment, controlled adult beta, then explicit owner-approved production release.

**Acceptance:** all release gates in Section 12 signed off.

## 5. Core data model — reconcile existing migrations, do not duplicate
Existing draft schema: `accounts`, restricted `account_birth_dates`, `verification_records`, `profiles`, `profile_photos`, `preferences`, `compatibility_answers`.

Planned additional tables: `likes`/`interests`, `passes`, `saved_profiles`, `connections` (canonical pair), `blocks`, `reports`, `moderation_actions`, `conversations`, `conversation_members`, `messages`, `notification_preferences`, `notification_events`/`delivery_jobs`, `staff_roles`, `audit_logs`, `market_config`/`enabled_markets`, optional `consent_records` and `account_deletion_requests`.

Use foreign keys, check constraints, unique constraints, indexes for query paths, timestamps and documented retention windows. Do not retain data indefinitely by default.

## 6. Access and RLS rules
Enable RLS on every table containing account, profile, preference, interaction, connection, message, report, verification, moderation, staff or subscription data.
- Accounts: member can read only own safe account row; never update own status/age assurance/role.
- DOB and verification records: no member browser grants; trusted server only.
- Profile: owner manages own private profile; other members receive only a server-projected safe subset when discovery policy allows.
- Preferences and compatibility answers: owner only; never expose to candidate.
- Photos: private bucket; owner access to own assets; approved photo read via authorized signed URL/projection; moderator access narrowly scoped.
- Likes/passes/saves: actor-only; never expose pass history.
- Connections: participants only; creation only via transactional reciprocal-interest function.
- Blocks: blocker can manage own block; blocked party cannot enumerate who blocked them.
- Reports/moderation/audit: reporter sees limited own report status; only authorized staff can read internal details; ordinary members cannot alter audit records.
- Conversations/messages: connection participants only; validate every operation and realtime channel.
- Staff roles: no self-service assignment; server-controlled.

RLS is defense-in-depth, not a substitute for server authorization. Test direct PostgREST access too.

## 7. Server API/action contract
Logical contracts (not existing implemented endpoints): `signUp(email,password,dob,market,consentVersion)`, `signIn`, `signOut`, `requestPasswordReset`, `completePasswordReset`, `resendEmailVerification`, `getCurrentMemberAccess`, `beginAgeAssurance`, provider callback handler, `saveProfile`, `savePreferences`, `createPhotoUploadIntent`, `completePhotoUpload`, `getDiscoveryPage(filters,cursor)`, `recordInterest(targetId,idempotencyKey)`, `recordPass`, `saveProfileForLater`, `createBlock`, `removeBlock`, `createReport`, `unmatch`, `getConversations`, `getMessages`, `sendMessage`, and staff-only report/moderation/suspension actions.

All inputs are validated server-side. Return safe error codes, not database internals. Apply rate limits and idempotency to mutations.

## 8. Authentication and age-assurance state machine
Suggested lifecycle: `pending_email → pending_age_assurance → eligible → suspended / blocked / deletion_pending → deleted`.

Eligibility requires confirmed email; a provider-backed, verifiable age-assurance pass; enabled market; market-specific minimum age met; and account not suspended/blocked/deleted. Provider webhook must verify signature/timestamp, enforce idempotency, bind reference to correct account, store minimal outcome/reference, log transitions, fail closed on timeout/error/unknown state, and never accept browser-submitted `age_verified=true`. Choose provider only after launch-market and privacy/legal review. DOB alone is not a substitute.

## 9. Environment configuration
`.env.local` is untracked and local only. `.env.example` contains placeholders only. Expected variables:
```env
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# Server-only; only if narrowly justified:
SUPABASE_SERVICE_ROLE_KEY=
AGE_ASSURANCE_PROVIDER_API_KEY=
AGE_ASSURANCE_WEBHOOK_SECRET=
EMAIL_PROVIDER_API_KEY=
EMAIL_FROM_ADDRESS=
```
Never paste credentials into chat, commit them, include them in screenshots, or expose them in client bundles. Prefer user-scoped Supabase server clients and RLS. Use service-role credentials only in isolated server-only modules. Separate local, staging and production secrets.

## 10. Developer setup
1. Install Node.js LTS supported by the selected Next.js release.
2. Extract this project and open `mingle-web` in VS Code.
3. Run `npm ci`.
4. Run `npm install @supabase/supabase-js @supabase/ssr`.
5. Create Supabase development project; copy URL and publishable key to `.env.local`.
6. Keep email confirmation enabled; configure local callback URL `http://localhost:3000`.
7. Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run format:check`, `npm run build`.
8. Do not apply draft migrations until Batch B has corrected and reviewed them.
9. Use a dedicated staging project for integration tests; never use production member data.
10. Run local server with `npm run dev`.

## 11. Required verification matrix
Test build/typecheck/lint/unit tests; auth sign-up/confirmation/login/logout/recovery/expired links/generic errors; access for anonymous, email-unconfirmed, age-pending, age-failed, eligible, suspended, blocked and deleted; data isolation for two users; discovery mutual preferences/blocks/market gate/moderation/pagination/private projection; interest idempotency/replay/concurrency/exactly-one connection; messaging participant checks/block/unmatch/realtime; admin role separation/audit; storage invalid type/signature/size/EXIF/pending moderation/signed URL expiry/cross-account access; deletion/session revocation/retention.

## 12. Mandatory release gates
1. Verified age and market eligibility enforced server-side.
2. Email-confirmed and age-assured accounts only enter member areas.
3. RLS and cross-account tests pass on every private table and storage bucket.
4. No fake/demo fixtures in production routes.
5. Discovery and connections are real, mutual, idempotent and safe.
6. Report/block/unmatch and staffed moderation work.
7. Admin roles are server-enforced and audited.
8. Messaging is restricted to valid connections.
9. Privacy, terms, community rules, retention and deletion have legal review.
10. Initial-market legal review, support and incident response are complete.
11. Production build and full tests pass in CI.
12. Backups/restore and rollback are tested.
13. Owner explicitly approves release.

**Current release status: NOT LAUNCH-READY.** No public production release or live member access until all gates pass.


## Batch D source implementation note

Discovery and reciprocal connection SQL, server loaders/actions and member route integration are now present in `supabase/migrations/20261110000003_discovery_connections.sql`, `lib/discovery/` and the Discover/Connections routes. Cross-member profile-table reads remain denied; a narrow RPC returns only approved candidate projection fields and aggregate compatibility signals. See `BATCH_D_IMPLEMENTATION_NOTES.md` for limits and verification status.


## Batch E source implementation note

Batch E adds restricted report and staff tables, server-checked admin roles, report submission and throttling, report/photo moderation RPCs, suspension, private photo signing, and audit event retrieval. See `BATCH_E_IMPLEMENTATION_NOTES.md`. Remaining work includes anonymous reporting policy decisions, evidence handling, appeals, retention/deletion, notification workflows, incident runbooks and live integration/security testing.


## Batch G source implementation note

Batch G adds connection-bound conversations, membership records, text messages, cursor pagination, rate-limited send RPC, per-conversation read cursors, unmatch revocation, RLS-filtered Postgres Changes, in-app notification events, member preferences and a private email outbox. The outbox remains awaiting provider configuration; no transactional email provider is selected or sending. See `BATCH_G_IMPLEMENTATION_NOTES.md` for delivered scope and verification gaps.


## Batch H — Release hardening implementation status

Source-level release artifacts are now included: CI workflow, CodeQL/Dependabot configuration, static RLS/service-role audit, SQL RLS inventory, security headers, minimal liveness endpoint, privacy-safe structured logging, accessibility checklist, incident response runbook, backup/restore plan and controlled-beta release gates. These do not establish that CI has passed or that a live Supabase deployment is secure. Live RLS, integration, end-to-end, accessibility, backup/restore and operational drills remain mandatory. No launch market or provider has been selected.
