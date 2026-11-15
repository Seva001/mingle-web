# Mingle Batch C — implementation notes

Status: implementation pass integrated; live database verification remains pending.

## Delivered in source

- Reviewed and replaced the draft `20261110000002_member_profiles.sql` migration.
- Added account-owned `profiles`, `preferences`, `compatibility_answers` and `profile_photos` tables with constraints, indexes, timestamps and RLS.
- Added a private `profile-photos` Storage bucket. Storage object policies restrict members to their own account folder; the bucket is not public.
- Added a server-side profile age RPC that returns only the signed-in member's age and does not grant browser access to the DOB table.
- Added authenticated profile-step persistence. Member identity is derived from `auth.uid()`; clients cannot choose an account ID.
- Added compatibility answer allow-list validation in the database RPC, not only in client code.
- Added private photo upload and deletion handlers. Uploads require an active account, same-origin request, accepted image signature and bounded size/dimensions. Sharp decodes, rotates, resizes and re-encodes uploads as JPEG before storage. The service-role key is used only inside these server routes so members cannot bypass image processing with direct Storage/PostgREST writes; it is never exposed to the browser.
- Photo records begin in `pending` moderation state. Members cannot approve photos. Signed preview URLs are short-lived and issued only to the owner.
- Added photo ordering RPC with account ownership checks and deferred position uniqueness.
- Connected the onboarding and profile overview screens to the authenticated server profile services. The age field is now sourced from the verified account DOB and is not user-editable.
- Added static contract tests for RLS, private storage, owner-only reads and server-side image processing.

## Deliberate boundaries

- Batch C does not grant cross-member profile or photo reads. Batch D must add a narrow, server-authorized discovery projection after mutual preferences, blocks, market eligibility and account status are checked.
- Photo moderation approval/rejection is not implemented in Batch C; uploaded photos remain pending and private. Batch E will provide staffed moderation controls.
- No Supabase project was created, no migration was applied, and no live RLS/Storage integration test has run. The photo upload/delete routes require `SUPABASE_SERVICE_ROLE_KEY` in server-only secret storage when Supabase is configured; other profile reads/writes use the member session and scoped RPCs.
- Rate limiting, malware scanning, moderation-provider integration, retention/deletion workflows and operational monitoring remain release-hardening work.
- The original preview/demo discovery, likes, messages, notifications, reporting and admin interfaces are not converted into production functionality by this batch.

## Verification status

Static source and ZIP checks only. `npm ci` did not complete in the working environment because package registry access timed out. Consequently TypeScript, ESLint, Vitest, Prettier and production build results are not claimed. Re-run all package scripts after dependencies can be installed, then apply migrations to `mingle-dev` and run two-account RLS and Storage integration tests before calling Batch C complete.
