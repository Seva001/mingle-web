# Mingle — Production Build Package
Version: 1.0 | Prepared: 10 November 2026

## Purpose

This is the execution contract for continuing the existing Mingle repository toward a real, international, adults-only connection platform. It is not permission to publish an unfinished service. It is not a request to rebuild from scratch.

**Primary rule:** inspect first, preserve working code, implement in small verified batches, and never describe a mock or local-only feature as production functionality.

## Product decisions

- Product: Mingle; compatibility-first, intentional connections.
- Audience: adults aged 18+ only.
- First client: responsive web application; native apps later.
- International ambition: global-ready foundations with controlled country/city activation.
- Visual identity: premium dark-first, complete light theme, restrained orange.
- Dark tokens: `#09090A`, `#161617`, `#FF6A1F`, `#F4F4F6`, `#8E8E98`, `#4C8DFF`.
- Light tokens: `#F4F4F1`, `#FFFFFF`, `#171719`, `#73737C`.
- Stack already present: Next.js App Router, React, TypeScript, Tailwind CSS, Vitest. Target backend: Supabase Auth, PostgreSQL, Storage and RLS. Hosting target: Vercel or equivalent.
- Free core experience first; subscriptions only after validation.
- No fabricated users, likes, matches, activity, scarcity, reviews or statistics.
- Compatibility is an explainable discovery aid, not a scientific prediction or guarantee.
- Essential safety controls must never be paywalled.

## Current repository reality

The project contains marketing pages, theme components, authentication UI/actions, profile onboarding/editor code, SQL migrations for accounts/eligibility and member profiles, and an initial local Discovery experience.

The current Discovery screen is explicitly a local demo: profile data comes from a browser-local profile store; recommendations use synthetic fixtures; likes, passes and saves are browser-local; no live member recommendation query is established; and no real mutual-interest transaction is established.

The member route layout currently renders the member shell without enforcing a verified server session and adult eligibility gate. Existing migrations are written but must not be assumed applied to a live Supabase project.

Do not silently remove the demo until a real backend path exists. Keep fixtures isolated from production imports and ensure production routes cannot return fixtures.

## Claude execution protocol

1. Read this file, `docs/PROJECT_PLAN.md`, `docs/DECISIONS.md`, `docs/DESIGN_SYSTEM.md`, `docs/PHASE_4_CLAUDE_WORKFLOW.md`, and the original product handoff if available.
2. Inspect the entire repository, package scripts, migrations, tests and git status.
3. Produce a concise audit: working, partial, demo-only, missing, risky and blocked by credentials/provider choices.
4. Do not overwrite or regenerate the project. Do not delete working pages or change brand tokens without a concrete defect.
5. Create branch `feat/production-discovery` if Git is initialized.
6. Implement one batch at a time. At every batch boundary, run checks and report exact results.
7. If dependencies cannot be installed, do not claim tests passed.
8. Never invent credentials, provider setup, successful migrations, verification status or production data.
9. Ask only for genuinely blocking choices/credentials; choose reversible defaults otherwise.
10. Never deploy or enable public member discovery until every release gate is satisfied and the owner explicitly approves.

## Required architecture

### Application boundaries
- Server Components are the default for authenticated data reads.
- Client Components are only for interaction and receive minimum required data.
- All member data reads/mutations pass through authenticated server-side code (Server Actions, Route Handlers or narrowly scoped Postgres RPCs).
- Never trust client-supplied user IDs, age, verification flags, roles, country eligibility or compatibility scores.
- Derive member identity from the verified server session.
- Admin operations require server-side role checks and audit records.
- Validate every input on the server.

### Supabase
- Use the supported Supabase SSR pattern compatible with the installed Next.js version; verify current package documentation before choosing versions.
- Use cookie-aware server/browser clients with clear module boundaries.
- Apply migrations in version control; no undocumented dashboard-only schema changes.
- Enable RLS on every table containing member, interaction, message, report, verification or subscription data.
- Test RLS with two separate authenticated users plus anonymous and moderator/admin contexts.
- Service-role key is server-only and must never enter client bundles.
- Prefer narrowly scoped database functions for atomic transitions; use transactions and constraints to prevent duplicate likes/connections.
- Use private object storage for member photos, validated upload types/sizes, safe image processing, moderation state and short-lived signed URLs.
- Never expose private storage paths or identity/verification documents.

### Core data domains
Reuse/reconcile the existing schema; do not create competing duplicates:
1. `profiles`: public/member fields, lifecycle state, coarse location and visibility.
2. `preferences`: discovery preferences and mutual eligibility.
3. `profile_photos`: private object references, ordering, moderation and visibility.
4. `compatibility_answers`: versioned answers with strict access controls.
5. `likes` or `interests`: actor, target, action, timestamp, uniqueness and state.
6. `passes`: actor, target, timestamp, uniqueness; never exposed to target.
7. `saved_profiles`: actor, target, timestamp; private to saver.
8. `connections`: canonical member pair, created only after reciprocal interest and eligibility checks.
9. `blocks`: directional block records enforced across discovery, connections and messaging.
10. `reports`: reporter, subject, category, evidence references, status and timestamps; restricted access.
11. `verification_records`: minimal provider outcome/status/reference, no unnecessary identity payload.
12. `moderation_actions` and `audit_logs`: privileged action, actor, target, reason, timestamp and audit history.
13. `recommendation_events`: minimal relevance metrics; no sensitive inferred attributes.
14. Later: `conversations`, `conversation_members`, `messages`, `notifications`, `subscriptions`, `payments`.

Use UUIDs, foreign keys, timestamps, indexes and constraints. Define retention/deletion behavior.

### Discovery contract
- Candidates must be active, discoverable, adult-verified accounts only.
- Enforce both members' declared age ranges and gender/interest preferences symmetrically.
- Exclude self, blocked in either direction, held/suspended accounts where policy requires, connected users, dismissed users according to policy, and profiles not approved for discovery.
- Never expose exact coordinates, private contact details, verification metadata, private questionnaire answers, internal moderation fields or another member's pass action.
- Compatibility factors are limited to explicit, user-provided signals: relationship intention, values, lifestyle, interests and communication preferences. Version the weights and treat them as hypotheses.
- Do not infer religion, ethnicity, sexuality, health, politics, income or other sensitive traits.
- Server computes/validates scores; clients cannot submit ranking scores.
- Return concise explanations derived from shared explicit answers.
- Paginate with stable ordering and bounded page sizes.
- Add abuse controls/rate limits to discovery and interest actions.
- Interest mutation must be idempotent. Replays cannot create duplicate records/connections.
- Reciprocal interest creates exactly one connection in a database transaction after rechecking both users' eligibility, preferences and block state.
- Messaging is out of Phase 4 and must require a valid connection.

### International readiness
International-ready does not mean enabling every country immediately.
- Country: ISO 3166-1 alpha-2. Locale: BCP 47. Timezone: IANA identifier.
- Store timestamps in UTC (`timestamptz`); render in member-selected timezone.
- Locale, country, timezone, distance unit and currency are separate concepts. Never infer currency from language/timezone.
- Use translation dictionaries/message catalogs; avoid hard-coded UI strings in new features.
- Use country activation/allowlist configuration.
- Design for country-specific age assurance, privacy, consumer, online-safety, tax and payment requirements.
- Use coarse location only. Never show exact home location or precise coordinates.
- Do not launch in a country until legal review, age-assurance coverage, moderation and support operations are ready.
- Avoid location history unless necessary, justified, consented to and covered by retention policy.

### Safety, privacy and abuse prevention
Launch-blocking:
- Adults-only access and age-assurance provider/process appropriate to launch market. Self-entered date of birth alone is not sufficient where stronger assurance is required.
- Deny discovery/interactions unless eligibility is verified and current.
- Reporting, blocking, unmatching and moderation workflows.
- Moderator/admin role separation, least privilege and audit logs.
- Account recovery, session revocation, account deletion and retention policy.
- Privacy notice, terms, community guidelines and support route.
- Data minimization, encryption in transit/at rest, secure secrets.
- Rate limiting, spam/abuse detection and operational escalation.
- Country-specific legal review before activation.
- Never claim absolute safety.

## Implementation batches

### A — Production readiness audit
Verify repository, lockfile, Next.js compatibility, scripts, environment template, TypeScript/lint/tests/build. Identify local demo stores/fixtures and ensure they cannot enter production paths. Audit auth/layout, eligibility and migrations. Deliver severity-ranked issues. Acceptance: baseline checks recorded honestly.

### B — Supabase foundation and route protection
Add supported Supabase SSR clients and typed environment validation. Enforce server-side session and verified adult eligibility on member routes. Implement safe session lifecycle and errors. Acceptance: anonymous, unverified and ineligible accounts cannot load member pages/data; tests cover decisions; no privileged key leaks.

### C — Profile/preferences persistence
Reconcile existing profile migrations/types. Move onboarding and profile editing from local storage to authenticated database operations. Implement private photo storage lifecycle/moderation and persist mutual preferences/versioned compatibility answers. Acceptance: two real test accounts have isolated profiles; RLS prevents cross-account access; data is database-backed.

### D — Production Discovery
Implement server-side candidate retrieval, mutual preference filtering, explainable/versioned scoring, cursor pagination, bounded filters, pass/save/interest actions, idempotency, rate limits and atomic reciprocal connection creation. Enforce blocks and eligibility in every query/mutation. Replace local demo route only when integration tests pass. Acceptance: two independently authenticated accounts exercise the flow; exactly one connection on mutual interest; no ineligible/blocked/incompatible profile appears; no private fields leak; RLS/integration tests pass.

### E — Safety operations/admin
Implement report/block flows, restricted moderation queue, RBAC, audit logs, account deletion and retention. Acceptance: members cannot read reports/moderation records; blocks immediately affect discovery; moderator actions are authorized/logged.

### F — Internationalization/market configuration
Add locale infrastructure and first locale, country allowlist, country-specific policy config, timezone formatting, coarse location and distance preferences. Acceptance: locale switch works; timestamps render correctly; market activation is configurable and gated.

### G — Messaging (Phase 5)
Only after valid connection. Implement conversation membership authorization, message persistence/realtime, rate limits, abuse/report integration and notification preferences. Acceptance: only connection members can read/send; blocks/unmatches revoke access as policy defines; cross-user tests pass.

### H — Release hardening
Security/RLS review, dependency audit, accessibility, performance, backup/restore, incident runbooks, staging deployment and controlled adult beta. Acceptance: signed release checklist, rollback plan, monitoring and support ownership.

## Required test matrix
Anonymous; email-unverified; age-unverified; verified adult with incomplete profile; verified adult complete profile; mutually eligible pair; non-mutual pair; blocked pair both directions; pass/save/like; duplicate/replayed interest; concurrent reciprocal likes; suspended/reported account; moderator; admin; account deletion.

For every table, test select/insert/update/delete as anonymous, owner, another member and privileged role. Test storage access too.

## Environment and secrets
Keep `.env.example` names/descriptions only. Never put real values in Git, prompts, screenshots or logs. Expected categories: public Supabase URL/publishable key; server-only credential only if absolutely necessary; app URL/environment; age assurance and transactional email credentials; later rate-limit, payment and analytics credentials. Use separate local/staging/production environments; never point local development at production data.

## Release gates
1. Verified 18+ eligibility enforced server-side.
2. No discovery/messaging for unverified/ineligible accounts.
3. RLS and cross-account authorization tests pass.
4. Block/report/moderation functional and staffed.
5. Privacy, terms, community rules, retention/deletion reviewed.
6. Initial-market legal review complete.
7. Secure photo handling/moderation operational.
8. Monitoring, support, incident response, backup and rollback ready.
9. Production build and full tests pass in CI.
10. Owner explicitly approves public release.

## Required batch report
At each batch end report status (complete/partial/blocked), files changed, working features, migrations added/applied status, exact test commands/results, security/RLS coverage and gaps, credentials/manual steps, limitations and next prerequisites.

Never say production-ready, secure, verified, deployed or complete without evidence.
