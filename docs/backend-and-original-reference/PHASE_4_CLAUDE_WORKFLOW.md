# Mingle — Phase 4 Claude execution workflow

## Purpose

Continue the existing `mingle-web` repository without restarting it or replacing completed work. This workflow is grounded in the current repository and `Mingle_Build_Handoff_Brief.docx` (version 1.0, 9 Nov 2026).

## Repository reality at handoff

- Next.js App Router, TypeScript, Tailwind v4, React and Vitest are already scaffolded.
- Phase 1 public pages, theme tokens and navigation exist.
- Phase 2 auth rules and SQL migrations are written, but Supabase Auth, real age assurance, server session enforcement and database execution are not complete.
- Phase 3 profile screens exist, but profile data is local-browser demo data. Its SQL migration has not been applied or verified.
- Discovery previously contained a placeholder. The current Phase 4 working branch adds a clearly labelled synthetic-fixture discovery experience, mutual preference filtering, local demo actions and compatibility explanations.
- No real-member discovery, production likes, actual mutual connections, or live messaging is implemented.

## Rules for Claude

1. Work in the existing repository. Do not scaffold a new app, replace the design system, or regenerate unrelated pages.
2. Read `README.md`, `docs/PROJECT_PLAN.md`, `docs/DECISIONS.md`, `docs/DESIGN_SYSTEM.md`, this file, and the relevant code before editing.
3. Preserve the Mingle visual tokens and responsive design language. Use existing components where practical.
4. Treat all fixture profiles as synthetic. Never present them as real members and never seed them into a production database.
5. Keep adult-only eligibility as a hard launch requirement. Do not add a bypass, weaken eligibility, or enable real member discovery before server-side session enforcement and age assurance are implemented and tested.
6. Never infer sensitive traits. Do not use religion, ethnicity, politics, health or other sensitive traits in recommendations.
7. Respect both sides' explicit preferences: gender preference and age range must be mutually compatible. Exclude hidden profiles, blocked IDs and previously passed/liked profiles from discovery.
8. Compatibility is an explainable product hypothesis, not a scientific prediction. Missing answers must not be treated as mismatches. Show plain-language reasons and avoid guarantees.
9. Do not claim database, realtime, notification or cross-account functionality until it is connected and tested against Supabase with at least two isolated test accounts.
10. Do not expose service-role keys or other secrets in browser code, logs, screenshots or commits.
11. Do not deploy a public dating service. Keep noindex/robots restrictions until every launch gate is complete and the owner explicitly approves deployment.
12. Before each batch, list exact files to be changed and acceptance criteria. After each batch, report changed files, commands run, pass/fail output, unresolved issues and any manual steps.
13. Avoid broad rewrites. Make the smallest coherent change that meets the batch criteria.

## Current Phase 4 implementation boundary

The current branch is a local interaction prototype only:

- Discovery uses synthetic fixture profiles from `lib/discovery/fixtures.ts`.
- `lib/discovery/engine.ts` applies reciprocal age and gender preference checks and computes a transparent exploratory score from the documented weights.
- Likes, passes and saves are browser-local demo actions in `lib/discovery/demo-store.ts`.
- No fixture is a real person. No action is delivered to another account.
- A local like is not a mutual connection. Do not create a match or conversation from a local action.

## Batch 1 — audit and stabilise

Tasks:
- Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`.
- Fix only reproducible failures introduced by or exposed in Phase 4; record pre-existing failures separately.
- Verify localStorage reads are guarded and malformed data is safely ignored.
- Verify keyboard access, focus visibility, responsive layout and screen-reader labels for all discovery controls.

Acceptance:
- All available checks pass, or every remaining failure is documented with its exact output and cause.
- No real member data or external network call is used by the discovery demo.

## Batch 2 — recommendation logic

Tasks:
- Review reciprocal age and gender preference filtering, visibility, exclusion IDs and deterministic ordering.
- Validate compatibility weight normalisation, partial-answer behaviour and shared-interest explanation.
- Add tests for empty preferences, hidden profiles, blocked IDs, passed/liked IDs, boundary ages and reciprocal preferences.
- Keep location coarse. Do not calculate or display distance until a lawful, privacy-preserving location model is approved.

Acceptance:
- Unit tests cover all rules; no candidate can appear if either side's explicit preferences exclude the other.
- Explanations identify the signals used and never imply guaranteed outcomes.

## Batch 3 — interaction prototype

Tasks:
- Verify pass, save, remove-save and like states persist only in this browser.
- Provide clear empty, loading, storage-error and reset states.
- Ensure the UI states that all profiles are synthetic and actions are local-only.
- Keep Connections and Chats clearly unavailable rather than manufacturing matches or conversations.

Acceptance:
- Refresh preserves local demo actions; reset clears them; no action is described as notifying or connecting a real person.

## Batch 4 — real backend design (not activation)

Do not wire real discovery until Phase 2 and Phase 3 backend foundations are complete. First produce a reviewed implementation plan for:

- Server-side authenticated session and fail-closed adult-eligibility gate.
- Supabase schema for likes, passes, saved profiles, blocks and mutual connections.
- RLS policies and server-side RPC/transaction strategy to prevent duplicate actions and race conditions.
- Query rules that enforce reciprocal preferences and exclude blocked accounts before returning profile data.
- Photo moderation/approval and private storage URL handling.
- Rate limits, audit events, deletion/retention and abuse reporting integration.
- Integration tests with two eligible test accounts plus negative tests for unauthenticated, underage/unverified, blocked and hidden accounts.

Acceptance:
- A security-reviewed schema and test plan exist before any migration is applied.
- No production data or public access is enabled during this planning batch.

## Claude session operating protocol

Use one batch per Claude session. Do not ask Claude to "finish all of Phase 4" in one prompt. At the beginning of a new session, paste the recovery prompt below and attach/open the latest project ZIP or repository. After a batch, save the changed files to Git before starting another batch.

### Recovery prompt

You are continuing the existing Mingle repository, not starting a new project. Read `docs/PHASE_4_CLAUDE_WORKFLOW.md` and the project docs first. Inspect the current working tree and report the current Phase 4 state. Work on **one batch only**: [INSERT BATCH]. Before editing, list the exact files you intend to change and the acceptance criteria. Preserve existing code and design tokens; do not rewrite unrelated work. Keep all discovery profiles synthetic and all actions browser-local. Do not claim real matches, real accounts, Supabase integration or production readiness. Run the required checks after changes and report exact results, changed files, blockers and next manual step. If context or usage limits are approaching, stop at a clean checkpoint and write a concise `docs/PHASE_4_CHECKPOINT.md` with completed work, current files, commands/results, pending tasks and the exact next action. Do not spend the remaining session repeating work already done.

## Checkpoint template

- Batch:
- Completed:
- Files changed:
- Commands run and exact results:
- Known failures / blockers:
- Manual actions required:
- Next single task:
