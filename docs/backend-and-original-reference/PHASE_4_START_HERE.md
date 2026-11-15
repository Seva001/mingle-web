# Mingle Phase 4 — Start here in Claude

## What to upload

Upload the updated `mingle-web-phase4.zip` to Claude, or open the existing `mingle-web` repository in Claude Code. Do not upload an older ZIP after this one.

## First message to Claude

```text
We are continuing an existing project called Mingle. Do not create a new project and do not rewrite the repository.

Start by reading:
- README.md
- docs/PROJECT_PLAN.md
- docs/DECISIONS.md
- docs/DESIGN_SYSTEM.md
- docs/PHASE_4_CLAUDE_WORKFLOW.md

Then inspect the actual repository and report:
1. The current project structure and stack.
2. What Phase 1, 2 and 3 actually contain.
3. What Phase 4 code is already present.
4. Which items are local demo only and which are connected to a real backend.
5. Any errors or inconsistencies you find before editing.

Do not edit files during this first audit. Do not claim the project is production-ready. Keep all discovery fixtures synthetic and all demo actions local-only. Remember that the product is intended for adults 18+ and the real member experience must remain closed until adult eligibility, authentication and safety controls are implemented and tested.

After the audit, propose the smallest next batch. Wait for my approval before editing.
```

## After Claude completes the audit

Use the recovery prompt in `docs/PHASE_4_CLAUDE_WORKFLOW.md` and select **Batch 1 — audit and stabilise**. Do not ask Claude to complete every remaining phase in one session.

## If Claude approaches its usage limit

Send:

```text
Stop making changes now. Do not start another feature. Create or update docs/PHASE_4_CHECKPOINT.md with the exact completed work, changed files, commands run and their exact results, remaining errors, manual actions required, and one precise next action. Make sure the repository is in a clean, understandable state so another Claude session can continue without repeating work.
```

## Local verification commands

Run from the repository root in a Node.js 22 environment:

```bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
```

If `npm ci` fails, resolve the dependency/network issue before treating the other checks as valid. Do not deploy publicly as part of Phase 4.
