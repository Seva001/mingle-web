# Mingle Frontend Handoff — Pass 3 + Batch B–G source integration

## What this package is

This package preserves the Pass 3 frontend and adds Batch B authentication/access, Batch C profile persistence/private photo storage, Batch D discovery/connections, Batch E safety/moderation, Batch F international readiness, and Batch G messaging/notifications source. It is not a verified production build.

## Included screens and work

- Marketing/public site and existing design system.
- Authentication screens connected to server-action source for sign-up, sign-in, password recovery/reset, email confirmation and resend.
- Member shell/navigation, profile and onboarding surfaces.
- Discovery UI with advanced filters and profile detail preview.
- Messaging: connection-only conversation list, persisted message history, composer, cursor pagination, RLS-protected realtime row updates and read cursors.
- Notifications: persisted in-app activity, read state and member-owned email/in-app preferences; email outbox awaits provider configuration.
- Safety/report UI connected to the reporting RPC when configured; role-protected admin workspace when configured, with static preview retained only when Supabase is unconfigured.
- Unit tests and project decisions/design documentation.

## Pass 3 frontend report

- Static scan: 134 TS/TSX files, no syntax errors and no missing local imports.
- 28 routes reported.
- UI and local preview behaviour implemented in several screens.

## Batch B/C source integration

Batch B adds Supabase SSR clients, Next.js 16 proxy session refresh, Auth server actions, callback handling, fail-closed member access and corrected account/eligibility migration source. Batch C adds authenticated profile-step persistence, private photo upload/storage, signed owner previews, preference and answer persistence, and server-derived age display. See `HANDOFF/BATCH_B_IMPLEMENTATION_NOTES.md` and `HANDOFF/BATCH_C_IMPLEMENTATION_NOTES.md`.

## Not verified

Dependency installation, full TypeScript check, ESLint, Vitest, Prettier, Next.js production build, browser/device QA, keyboard/screen-reader QA, SQL migration execution, RLS integration and live Supabase Auth integration remain unverified.

## Not real backend functionality yet

No age-assurance provider is connected and no launch market is enabled. Messaging and in-app notification source is now integrated in Batch G but not live-Supabase verified. Email delivery remains disabled until a provider is selected and configured. Reporting, block actions, photo moderation, report resolution, account suspension, staff RBAC and audit source are implemented in Batches D/E but remain unverified against live Supabase. Batch C photo upload and private storage source exists; moderation decisions are now implemented in Batch E, while cross-member access, retention and live Storage verification remain outstanding.

Do not describe the app as production-complete. Do not remove demo/local states until a tested real backend replacement exists. Preserve the design system; no redesign.

## Backend integration update — Batch D (13 November 2026)

The Discover and Connections routes now have server-backed implementations when Supabase environment variables are configured. Without Supabase configured, the original synthetic discovery preview remains available. Real discovery is served through a narrow database projection and server-signed private photo URLs; likes, passes, saves and blocks use authenticated server actions and database RPCs. See `BATCH_D_IMPLEMENTATION_NOTES.md`. These routes remain unverified against a live Supabase project.

## Backend integration update — Batch E (13 November 2026)

The report form now submits authenticated member reports through a restricted RPC with validation and a per-member rolling 24-hour limit. The configured admin route checks staff role server-side and provides a moderation queue for reports and pending profile photos. Photo decisions, report status changes and admin account suspensions are recorded in a restricted audit table. The admin preview remains non-operational when Supabase is not configured. See `BATCH_E_IMPLEMENTATION_NOTES.md`. A post-integration static import scan covered 158 TS/TSX files with zero missing local imports. No live migration, SQL, authorization or production build verification has been performed.

## Batch G integration update — 13 November 2026

Chats and Notifications now use server loaders/actions and the Batch G schema source. Chats are tied to active mutual connections; unmatch/block revokes old chat access. Messages are paginated, rate-limited and persisted; realtime row delivery relies on messages-table RLS. Notifications and preferences persist. The email outbox remains awaiting provider configuration and does not send email. See `BATCH_G_IMPLEMENTATION_NOTES.md`.


## Batch H release hardening update

Batch H adds CI/security workflows, static release audit, browser security headers, a minimal liveness endpoint and operational runbooks. These are source-level preparations only. No live database, browser, accessibility, monitoring, backup/restore or production deployment verification has been performed. MINGLE remains not cleared for staging or beta. See `BATCH_H_IMPLEMENTATION_NOTES.md` and `../docs/release/RELEASE_GATES.md`.
