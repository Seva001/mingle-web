# MINGLE Batch H — Release Hardening

**Status:** Release-hardening source and operational artifacts integrated. This is not a production clearance.

## Delivered

- Added GitHub Actions CI for `npm ci`, static release audit, TypeScript, ESLint, Vitest, Prettier and Next.js production build.
- Added CodeQL analysis workflow for JavaScript/TypeScript and Dependabot weekly updates for npm and GitHub Actions.
- Added `scripts/release-audit.mjs`, which inventories SQL-created public tables and verifies explicit RLS enable statements, scans application source for public service-role environment naming, and checks core release artifacts/security headers.
- Added a minimal `/api/health` liveness endpoint. It returns no environment configuration, database details, member data or secrets.
- Extended response security headers with Cross-Origin-Opener-Policy and disabled DNS prefetch. HSTS is added only when `NEXT_PUBLIC_APP_ENV=production`; it uses a one-year max age without assuming every subdomain is HTTPS.
- Added a privacy-preserving structured logger with fixed event names and allowlisted metadata fields. It intentionally does not accept arbitrary objects or error messages.
- Added RLS inventory SQL for the target Supabase project.
- Added release gates/controlled-beta checklist, incident response runbook, backup/restore plan and WCAG 2.2 AA accessibility QA checklist.
- Added static contract tests for the Batch H release controls.
- Preserved the existing MINGLE UI and international/market-neutral product decisions. No country, language, currency, age-assurance vendor, email provider, hosting provider or monitoring vendor is selected by Batch H.

## Verification performed in this workspace

- Static release audit: passed; 24 public SQL tables across 6 migrations inspected for explicit RLS enable statements.
- The static audit found no public service-role environment variable naming in `app/`, `components/` or `lib/`.
- `package.json` remains valid JSON; CI workflow and required runbooks are present.
- TypeScript syntax transpilation and local-import scan were run separately for the integrated source (see final handoff verification summary).
- ZIP integrity checked after packaging.

## Not verified / operationally outstanding

- No dependencies were installed in this environment. `npm ci`, dependency-backed typecheck, ESLint, Vitest, Prettier and Next production build have not been executed here. The CI workflow is committed but has not run on GitHub.
- CodeQL and Dependabot are configured as repository workflows, not executed in this workspace.
- The SQL inventory query has not been run against a live Supabase database. Static RLS presence does not prove policy correctness or prevent privilege escalation.
- No Supabase project exists in this workflow; migrations are unapplied. No two-account integration, RLS role matrix, realtime test, or end-to-end browser test has passed.
- No monitoring vendor, alert routing, on-call team, backup schedule, point-in-time recovery, restore drill, or incident contacts are configured.
- Accessibility documentation is a test plan; no browser/screen-reader audit has been performed.
- Legal review, first launch market, provider-backed age assurance, provider email delivery, retention/deletion automation and support/moderation staffing remain release blockers.
- A liveness endpoint is not a database readiness check and does not establish that the application can serve authenticated traffic.

## Release decision

**NOT CLEARED FOR STAGING, CLOSED BETA OR PUBLIC LAUNCH.** Complete the release checklist in `docs/release/RELEASE_GATES.md`, run all dependency-backed CI checks, apply and test migrations in a disposable environment, complete role-based security/E2E/accessibility tests, configure operations and successfully rehearse restore and rollback before any beta approval.
