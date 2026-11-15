# Mingle — Existing Frontend + Backend Build Workspace

This is the existing Mingle Next.js application. Continue from the supplied frontend and preserve its UI, routes, components and design system.

## Start here

For backend development, read:
1. `HANDOFF/BACKEND_SPECIFICATION.md`
2. `HANDOFF/BATCH_B_IMPLEMENTATION_NOTES.md`
3. `HANDOFF/FRONTEND_STATUS.md`

For the frontend baseline, read:
1. `docs/FRONTEND_START_HERE.md`
2. `docs/FRONTEND_REQUIREMENTS.md`
3. `docs/DESIGN_SYSTEM.md`
4. `docs/DECISIONS.md`
5. `docs/FRONTEND_TASK_BREAKDOWN.md`
6. `docs/FRONTEND_PROGRESS.md`

## Stack

Next.js App Router 16.x, React 19, TypeScript strict, Tailwind CSS v4, Vitest, Supabase Auth, PostgreSQL, RLS and private Storage.

## Commands

After regenerating the package lock and installing dependencies:

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
npm run dev
```

## Backend status

Batch B–G source integration is present but not verified against a live Supabase project. Authentication, persisted profiles, private photos, discovery/connections, reporting, photo moderation, staff RBAC, suspension, audit, market allowlist, locale and timezone source, connection-only messaging, notifications and preferences have been integrated. Supabase project setup and migration application remain intentionally deferred until all backend batches are built. Provider-backed age assurance, launch-market approval, retention/re-consent workflows, SQL/RLS integration tests, dependency installation, full runtime checks, email provider delivery and release hardening remain outstanding. See the batch-specific notes in `HANDOFF/`.


## Backend continuation status

Batches B–G have source implementation passes integrated. No Supabase project has been created, no migrations have been applied, no launch market is enabled, and full dependency-backed/database verification is outstanding. See `HANDOFF/README.md` and the batch implementation notes before setup.

Batch G implementation details and verification gaps: `HANDOFF/BATCH_G_IMPLEMENTATION_NOTES.md`.


## Release hardening

Batch H source artifacts are included. See `HANDOFF/BATCH_H_IMPLEMENTATION_NOTES.md` and `docs/release/RELEASE_GATES.md`. The project is not cleared for staging or launch: no Supabase project is connected, migrations are unapplied, and dependency-backed CI, live security tests, accessibility, monitoring and backup/restore drills remain outstanding.
