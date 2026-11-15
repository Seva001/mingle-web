# Mingle — Pre-Integration Audit (13 November 2026)

## Scope and assumptions

This review treats the supplied Batch H source as a **pre-integration codebase**. No live Supabase project, credentials, applied migrations, production email provider, or age-assurance provider were supplied. Therefore, missing live services are recorded as integration work, not automatically as source-code defects.

The original uploaded ZIP was preserved. Corrections in this folder are a separate working copy.

## Validation actually completed

| Check | Result | Notes |
|---|---|---|
| ZIP extraction / source inspection | Completed | Reviewed extracted `mingle-web` source. |
| TypeScript/TSX syntax transpilation | Passed | 173 files; zero syntax diagnostics using the globally installed TypeScript transpiler. This is syntax-only, not semantic typechecking. |
| Local import scan | Passed in supplied static baseline | 402 import references; zero missing local imports were reported in the earlier baseline scan. |
| Static release audit | Passed | 24 public SQL tables across six migrations; explicit RLS declarations, service-role naming scan, headers and release artifacts checked. |
| SQL review | Static review only | Six migrations read in filename order. No PostgreSQL/Supabase instance was available to parse/apply them. |
| `npm ci` | Not completed | Attempted with `--ignore-scripts --prefer-offline --no-audit --no-fund`; timed out. |
| TypeScript semantic typecheck, ESLint, Prettier, Vitest, Next build | Not verified | Dependencies were unavailable. |
| RLS / Storage / cross-account integration tests | Not run | Requires a local or development Supabase/Postgres environment and test identities. |

## Corrections applied in this working copy

### C01 — Invalid SQL alias in market administration

**File:** `supabase/migrations/20261110000005_international_readiness.sql`

The administrator check joined `auth.users` using the undefined alias `operator.id`. Changed the join to `admin_account.id`, which is the alias already defined for the staff account row. This is a confirmed SQL execution defect in the supplied source.

### C02 — Runtime validation for profile server actions

**File:** `lib/profile/actions.ts`

Added runtime guards for the section key and payload shape; validated strings, gender, arrays, age bounds, distance choices and questionnaire answers before dereferencing values. Moved Supabase setup/auth/account access inside error handling so an unavailable backend returns the action's normal failure shape instead of an uncaught exception. Added a runtime boolean check for profile visibility.

### C03 — Runtime validation for safety report server action

**File:** `lib/safety/actions.ts`

Added object and field-type checks before calling `.trim()`. Malformed server-action payloads now return a validation response rather than throwing before the `try` block.

### C04 — Enforce private Storage bucket size after image processing

**File:** `app/api/profile/photos/route.ts`

The endpoint accepted original files up to 15 MiB while the migration configures the private Storage bucket for 10 MiB. Added a 10 MiB post-normalization check so the route rejects an oversized processed JPEG before attempting upload. The original input cap remains 15 MiB.

### C05 — Align market display-name length with the profile country column

**File:** `supabase/migrations/20261110000005_international_readiness.sql`

Market display names feed the `profiles.country` field through a trigger. The profile column allows at most 60 characters, while market configuration previously allowed 80. Reduced the market display-name constraint and RPC validation to 60 so a valid market configuration cannot later make profile writes fail due to the downstream column constraint.

## Additional findings — not yet corrected

### High priority

1. **No live age-assurance provider is configured.** `lib/auth/age-assurance.ts` intentionally returns `null`. This is expected pre-integration work, but normal member access must remain closed until a real provider-backed outcome is verified.
2. **No first-market bootstrap runbook.** Markets are intentionally created disabled and signup requires an enabled market. The SQL notes that the first admin is provisioned out-of-band, but the handoff should document the exact trusted bootstrap sequence (market seed, first verified admin, staff membership) and how it is audited. Do not enable a market with draft legal/policy values.
3. **No actual PostgreSQL migration execution or role-based RLS test suite.** `supabase/tests/rls_inventory.sql` is an inventory query, not a behavioral security test. It does not prove owner/other-member/moderator/admin isolation.
4. **Account deletion, export and retention execution are absent.** The planned `account_deletion_requests` table/workflow is not in the six migrations. `market_config.retention_days` stores a value but no scheduled retention/deletion worker is included. Account deletion must also remove private Storage objects, not only cascade database rows.
5. **Email outbox has no delivery worker/provider.** The migration deliberately leaves events `awaiting_provider`; no sending or retry worker is supplied. This is expected until an email provider is selected, but must be completed before email notifications are described as operational.

### Medium priority

6. **Discovery uses offset pagination, not cursor pagination.** The discovery RPC and server API use `result_offset`; the Batch D handoff calls for cursor pagination. Offset paging can skip/repeat candidates as the candidate set changes. Decide whether to implement a stable cursor before release.
7. **Photo position allocation is not atomic at the route level.** Two simultaneous uploads can choose the same free position. The unique `(account_id, position)` constraint prevents duplicate positions, so one insert should fail rather than corrupt the table, but the losing request currently returns a generic 503. Consider a database RPC/transaction to reserve a position and return a conflict response.
8. **Photo deletion spans Storage and PostgreSQL without a transaction.** The route deletes the Storage object first and then the row. If the row deletion fails, the database can retain a record pointing to a missing object. A retryable deletion state or cleanup job is safer.
9. **Upload body memory protection is not complete.** The route checks `Content-Length` when present, but calls `request.formData()` before validating the actual file size. A missing/unreliable content-length header can still cause the body to be parsed into memory before the file-size check. Enforce a request-body limit at the hosting ingress and/or use bounded streaming parsing.
10. **Admin server actions also need runtime input guards.** `lib/admin/actions.ts` calls `.slice()` and `.replaceAll()` on typed fields inside actions. Database RPCs enforce role and core constraints, but malformed payloads can still produce avoidable exceptions or misleading messages.
11. **Historical audit document is stale.** `INITIAL_PRODUCTION_AUDIT.md` describes the earlier frontend-only baseline and says Supabase integration is absent. It should be treated as historical, not as a status description of this Batch H source.

## Expected pre-integration work (not defects by themselves)

- Missing `.env.local` values / Supabase connection.
- No applied database migrations or live RLS behavior yet.
- No real age-assurance provider callback.
- No email provider or outbox worker.
- No live photo storage, messaging, realtime, discovery or moderation data until Supabase is configured.

These are integration milestones. Do not fake successful verification or create production fixtures to make the UI appear live.

## Recommended next actions

1. Install dependencies on the developer's machine using the committed lockfile; run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `npm run build` and `npm run security:audit`.
2. Review the four code corrections in this working copy, then add focused unit tests for malformed profile/report payloads and processed-photo size rejection.
3. Decide and document discovery cursor semantics and the first-admin/first-market bootstrap procedure.
4. Add account deletion/export/retention and Storage orphan cleanup designs before beta.
5. Only then create `mingle-dev`, review migrations, apply them in order, and execute cross-account tests as anonymous, owner, another member, moderator and administrator.

## Status

**Pre-integration source: partially validated. Not production-ready.** Syntax and the supplied static release audit pass. Semantic build checks and all database/provider behaviors remain unverified.
