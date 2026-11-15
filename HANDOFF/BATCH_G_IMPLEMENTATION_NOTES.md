# MINGLE Batch G — Messaging & Notifications

**Status:** Source implementation pass integrated into the existing project. Not applied to Supabase and not production-verified.

## Delivered

- Added `supabase/migrations/20261110000006_messaging_notifications.sql`.
- A conversation is created automatically for each canonical reciprocal connection. Existing connections are backfilled.
- Conversation membership is recorded for both members. Server RPCs and message-table RLS require an active account, membership, the still-existing canonical connection, active status for both accounts, and no block in either direction.
- Messages are plain text with a 1–5,000 character bound, server-derived sender identity, a 20-message-per-minute member-wide rate limit, UTC timestamps, and a `(conversation_id, created_at, id)` cursor index.
- Message history is loaded through a participant-checked RPC with cursor arguments. The chat UI includes a load-older control and a Supabase Postgres Changes subscription on the messages table; table RLS filters each changed row to currently authorized participants.
- Opening a chat updates a per-conversation read cursor. Unread counts are computed from messages newer than that cursor.
- Added `unmatch_member`. Blocking or unmatching deletes the canonical connection; the conversation record and message history remain retained, but its connection foreign key becomes null and all member read/send/realtime access is denied. A later new mutual connection creates a separate conversation.
- Notifications are persisted as in-app events for new mutual connections and messages, with member-only reads and server-controlled read/mark-all actions. Message events are scoped to their conversation.
- Added member-owned notification preferences for in-app messages, email messages and product updates.
- Added a private email outbox with `awaiting_provider` state. It stores minimal template metadata and does not expose jobs to members.
- Replaced the Chats and Notifications route previews with server-backed route components while retaining the existing visual design language. The chat list and notification timestamps use the member's saved locale and timezone.
- Added generated-style database type entries and `tests/messaging-notifications-backend.test.ts` static contract coverage.

## Security and product decisions

- MINGLE remains international and market-neutral in this batch. No launch country, market, language or currency has been selected; messaging authorization follows the existing active-account and mutual-connection rules.

- No cross-market restriction was added to messaging. Conversation eligibility is based on a valid mutual connection; Batch F's market and account eligibility gates still apply.
- Message reads are available through a narrow server RPC and through table SELECT protected by RLS for Postgres Changes. Clients do not receive direct message insert/update/delete privileges.
- The browser subscription is filtered to the selected conversation, but row visibility is enforced by database RLS, not by trusting the client-supplied conversation id.
- Message attachments are not enabled in this batch. No attachment bucket, file upload or attachment download path is exposed.
- Email provider selection, credentials, delivery worker, retry/dead-letter policy, bounce handling, unsubscribe/compliance handling and provider webhook verification are not implemented. Email events remain `awaiting_provider`; no email is sent by this code.
- Push notifications are not implemented.
- No typing indicators, message edits/deletes, disappearing messages, read receipts visible to the other participant, end-to-end encryption or message search are included.
- Messages are retained after block/unmatch but become inaccessible to both members through the app. A legally reviewed retention/deletion policy and privileged support workflow are still required.

## Verification performed

- Syntax-only TypeScript transpilation covered 170 TS/TSX files: 0 syntax diagnostics.
- Static local-import scan: 0 missing local imports.
- SQL source checks passed for balanced `$$` delimiters and parentheses, RLS enablement on all seven new private tables, service-role-only outbox access, bilateral block revocation, connection membership checks, message length/rate limits, cursor pagination, unmatch revocation and provider-pending email state.
- `package.json` and `package-lock.json` parse as valid JSON.
- Static Vitest contract coverage was added/updated; Vitest itself was not run because `node_modules` is absent.
- ZIP integrity is checked after packaging.

## Not verified / outstanding

- The SQL migration has not been parsed by PostgreSQL or applied to a Supabase project. No `psql` or Supabase CLI is available in this environment. Trigger behavior, function grants, RLS policies, Postgres Changes publication and realtime authorization require live two-account integration tests.
- Dependency installation, a dependency-backed `tsc --noEmit`, ESLint, Vitest, Prettier and Next production build are not verified because `node_modules` is absent. A syntax-only transpilation is not a typecheck.
- Supabase Realtime behavior and the `supabase_realtime` publication must be checked in the selected project.
- The email outbox is intentionally dormant until an email provider and operational worker are selected and tested.
- Notification event coverage is currently focused on new messages; match, safety and account event producers need to be connected as those product workflows are completed.
- No end-to-end tests yet prove that anonymous, unrelated, blocked, unmatched, suspended or deleted accounts cannot read/send/subscribe.

**Batch G is an integrated implementation pass, not a claim of verified or production-ready messaging.**
