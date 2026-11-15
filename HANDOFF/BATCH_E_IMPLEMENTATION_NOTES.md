# Batch E implementation notes — Safety & administration

Date: 13 November 2026

## Implemented in source

- Added `20261110000004_safety_admin.sql` after Batch D.
- Added restricted `admin_memberships`, `safety_reports`, and `moderation_audit_events` tables. RLS is enabled; direct `anon` and `authenticated` table access is revoked. Admin membership is provisioned out-of-band with the service role / SQL editor and cannot be self-assigned through signup or the member app.
- Added `has_admin_role` as a narrow boolean role check. Staff roles are `admin`, `moderator`, and `support`; authorization is checked again inside every privileged database RPC.
- Added authenticated `submit_safety_report`: reporter identity comes from `auth.uid()`, category and text length are validated, self-reporting is blocked, target account references are checked, and submissions are capped at five per reporter per rolling 24 hours. Threat and safety categories receive high priority. No file attachments or private evidence uploads are accepted in this pass.
- Connected the public report page to a server action. Submission requires a signed-in active member; reports are stored in the restricted table and no success is shown until the RPC succeeds.
- Added a staff moderation queue RPC for open/under-review reports and pending photos. The projection exposes only the case fields needed by staff; no DOB, private questionnaire answers, or private contact details are returned.
- Added private photo moderation: server signs short-lived private Storage URLs; admin/moderator RPC can approve or reject pending photos. The existing profile-completion trigger recalculates profile readiness after the moderation state changes. The member photo manager now labels pending, approved and rejected images; rejected images can be removed and replaced.
- Added report status workflow (`under_review`, `resolved`, `dismissed`) with bounded internal resolution notes.
- Added admin-only account suspension with a reason. Suspension changes account status, removes active connections involving the target, and is recorded in the audit log. The existing member access gate fails closed on suspended accounts.
- Added append-only-by-permission audit history. Direct member reads/writes are revoked; audit retrieval is restricted to admins. Every photo decision, report state change, and suspension creates a server-side audit event.
- Replaced the configured admin route with a role-protected server-rendered workspace. The unconfigured project retains the non-operational preview instead of fabricating data.
- Added static backend contract tests and Batch E RPC type declarations.

## Operational and product limits

- No Supabase project has been created and no migration has been applied. First admin provisioning is intentionally manual and must be done through the trusted SQL editor/service role after project setup.
- The report page requires a signed-in active member. Anonymous public reporting is not supported in this batch.
- The optional report target is a MINGLE account UUID/reference, not a display-name search. The UI must not imply arbitrary names are resolved to member records.
- No evidence attachment pipeline, report appeals workflow, automated threat detection, IP/device rate limiting, moderator assignment dashboard, member notification on case outcomes, or retention/deletion policy is implemented yet.
- Admin suspension does not restore accounts. Restoration needs a separately reviewed workflow and must re-check email confirmation, provider-backed age assurance, market eligibility, and any legal/safety hold before access can resume.
- The admin queue has bounded first-page retrieval (50 records); advanced search, cursor pagination and analytics are not included.
- Private photo signing uses a five-minute URL and requires the server-only service-role key. Missing credentials fail closed.
- Admin and moderator authorization is database-enforced; support role can update report status but cannot review photos, suspend accounts, or read audit history.

## Verification status

- Source-level static contract tests added; local import scan and ZIP integrity are checked during packaging.
- Dependencies are not installed in this environment. TypeScript, ESLint, Vitest and Next production build remain unverified.
- SQL syntax, RLS behavior, SECURITY DEFINER privilege boundaries, role provisioning, queue projections, report rate-limit concurrency, photo signing and moderation triggers require validation in a disposable Supabase/PostgreSQL environment.
- Do not mark this batch production-ready until database integration, authorization tests, abuse testing, operational policy and legal review are complete.
