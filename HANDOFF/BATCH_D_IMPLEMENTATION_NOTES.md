# Batch D implementation notes — Discovery & connections

Date: 13 November 2026

## Implemented in source

- Added `20261110000003_discovery_connections.sql` after the Batch B/C migrations.
- Added private action tables for likes, passes, saved profiles, blocks and mutual connections. RLS is enabled on every table; direct member writes are revoked and all actions are mediated by authenticated RPCs deriving the actor from `auth.uid()`.
- Added `get_discovery_candidates`, a narrow security-definer projection. It requires an active member with a complete, visible profile; only returns complete, visible, active candidates with an approved photo; enforces reciprocal gender and age preferences; excludes passes, likes, blocks and existing connections.
- The projection returns approved photo object paths for server-only signing and selected public-facing profile fields. It does not return DOB, exact location, raw compatibility answers, pass history or report data. It returns aggregate shared-interest / aligned-answer signals only.
- Added atomic/idempotent `like_member`: it validates both sides' current preferences and creates a unique connection only after a reciprocal like exists.
- Added `pass_member`, `toggle_saved_profile`, `block_member`, `get_my_connections`, and `get_my_saved_profiles` RPCs.
- Added server-side discovery loaders. Approved private photos receive five-minute signed URLs through the server-only service-role client.
- Added server actions for like, pass, save/unsave and block. They authenticate the current user, check active account status, validate target UUIDs and invoke the RPCs.
- Connected the Discover and Connections routes to server-backed views when the Supabase calls succeed. Existing synthetic fixture preview remains as a fallback for the unconfigured development workspace.
- Added static backend contract tests and Batch D database function typings.

## Important limits / follow-on work

- No Supabase project has been created and no migration has been applied. The SQL is authored but not validated by a live PostgreSQL/Supabase instance.
- The profile schema currently stores coarse city/country only. `max_distance_km` cannot be truthfully enforced without a reviewed location/coordinates design; candidate selection therefore does not claim distance filtering. Batch F deliberately keeps location coarse and does not add coordinates; distance controls must remain disabled until a separate privacy-reviewed location design is approved.
- Compatibility display is intentionally limited to shared interests, aligned answer count and shared intention. It does not reveal another member's raw private answers or claim a scientifically validated match score.
- Blocking is implemented in the database/action layer; user-facing report/block review, moderator workflows and retention controls are Batch E.
- Messaging authorization must re-check current connection existence and block state in Batch G; connection creation alone does not grant a permanent chat entitlement.
- Pagination uses bounded limit/offset for the initial release. Cursor-based pagination and ranking quality need production data and QA.
- No distance ranking, profile impression analytics, rate limiting, anti-spam controls or abuse detection are claimed complete.

## Verification status

- Source-level checks and ZIP integrity can be performed locally.
- Dependency installation previously timed out because package registry access was unavailable. TypeScript, ESLint, Vitest and Next production build remain unverified until dependencies can be installed.
- SQL syntax, RLS behavior, RPC concurrency, storage signing and reciprocal-match behavior require a disposable Supabase/PostgreSQL environment. Do not mark this batch production-ready before those tests.
- Like/pass/block operations serialize per member pair with a transaction-scoped advisory lock. This closes the simultaneous-like race where two reciprocal likes could otherwise both miss each other under concurrent transactions.
