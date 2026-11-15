# Mingle — Master Engineering Execution Brief

Continue the existing Mingle repository. Do not rebuild it.

Read `HANDOFF/FRONTEND_STATUS.md`, `HANDOFF/BACKEND_SPECIFICATION.md`, `docs/DECISIONS.md`, `docs/DESIGN_SYSTEM.md`, `INITIAL_PRODUCTION_AUDIT.md` and all existing migrations before changing code.

## Non-negotiable
- Preserve existing UI, layout, typography, components, themes and colour tokens.
- Do not fake account creation, verification, profiles, matches, messages, notifications, reports or admin operations.
- Do not claim tests/build/migrations/deployment succeeded unless run and verified.
- Never trust client-supplied user ID, age, role, eligibility, verification or compatibility score.
- RLS on every private table. Test with at least two authenticated users and anonymous access.
- Never expose service-role secrets in browser code or commit secrets.
- DOB declaration is not age assurance. Fail closed until provider-backed age assurance and email confirmation pass.
- Keep synthetic fixtures out of production code paths.
- No messaging without a valid connection.
- No public launch until all release gates pass and the owner approves.

## First execution — Batch B only
1. Inspect repository status, package scripts, routes, migrations and existing code.
2. Re-run baseline checks and report exact command/output.
3. Confirm Supabase project setup and local environment variables exist; never request secrets in chat.
4. Correct/review the existing account migration before applying anything.
5. Implement Supabase SSR clients, typed environment validation, auth integration, cookie/session lifecycle, server-side member route gate, fail-closed eligibility checks and tests.
6. Run typecheck, lint, unit tests, formatting and production build; report exact results.
7. Stop at Batch B completion and provide changed files, migration status, test evidence, security coverage, remaining blockers and exact next step.

Follow batches B–H in `HANDOFF/BACKEND_SPECIFICATION.md`. Do not skip prerequisites or perform a broad unreviewed rewrite.
