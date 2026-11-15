# Mingle — Frontend-Only Development Package

## Purpose

This repository is being completed in a **frontend-first phase**. Work only on the existing Next.js frontend, its routes, components, styles, client-side interactions, accessibility and frontend tests. The purpose is to finish the complete interface before a separately approved backend integration phase.

## Read these documents first

1. `README.md` — current project setup and repository layout.
2. `docs/DESIGN_SYSTEM.md` — authoritative design tokens, themes, typography, components and accessibility rules.
3. `docs/DECISIONS.md` — product and implementation decisions that affect existing UI behaviour.
4. `docs/FRONTEND_REQUIREMENTS.md` — scope and acceptance requirements for this frontend phase.
5. `docs/FRONTEND_TASK_BREAKDOWN.md` — small, sequential coding tasks.
6. `docs/FRONTEND_PROGRESS.md` — verified task status and next task.
7. `INITIAL_PRODUCTION_AUDIT.md` — baseline repository audit; use it to understand what exists and what is not connected.

The original product handoff and backend/release documents are preserved in `docs/backend-and-original-reference/` for later phases. They are reference material only during this phase. Do not follow their backend implementation instructions now.

## Hard scope boundary — frontend only

Do not implement or configure during this phase:
- Supabase clients, Auth, database queries, migrations or RLS.
- Backend API routes, server actions that perform backend mutations, Edge Functions or webhooks.
- Age-assurance provider integration or claims of verified age.
- Real email delivery, push delivery, realtime messaging or notification delivery.
- Production storage, signed URLs or server-side photo processing.
- Real moderation operations, admin permissions or account enforcement.
- Hosting, public deployment, payment processing or release activation.

Do not delete existing backend-related source files or migrations. Leave them untouched unless a frontend import/build issue requires a narrowly scoped change, in which case explain it and obtain approval before modifying backend files.

## What is allowed

- Build and refine pages, layouts, reusable React components and client-side state.
- Implement accessible forms and client-side validation.
- Implement realistic UI states: idle, loading, validation error, empty, success and failure.
- Use isolated, clearly labelled development fixtures only where a screen needs demonstration content.
- Implement local-only interactions that explicitly disclose they are demonstrations and do not affect real accounts.
- Add or update frontend unit/component tests using the existing test setup.

## Non-negotiable product integrity

- Never present fixtures as registered members.
- Never invent real matches, mutual connections, messages, notifications, usage metrics or moderation reports.
- Never claim that a form was delivered, a message was sent, an account was created, an age check passed, or a report reached staff when no backend exists.
- Keep adult-only eligibility messaging honest. A date-of-birth form is not age assurance.
- Do not use religion, ethnicity, politics, health or other sensitive traits in compatibility or recommendations.
- Do not promise that compatibility predicts relationship success.
- Keep the app's existing `noindex` / robots restrictions in place.

## Repository and implementation rules

- Continue inside this repository. Never scaffold a new app or replace the project.
- Preserve Next.js App Router, TypeScript, Tailwind CSS v4 and current dependencies.
- Inspect relevant files before changing them. Reuse existing components and utilities.
- Make the smallest coherent change. Avoid broad rewrites and unrelated formatting churn.
- Do not add dependencies unless a genuine requirement cannot be met with the existing stack; explain first.
- Do not expose secrets or add real credentials.
- Do not assume a task is complete because a plan says so; inspect the actual files and run the relevant check.

## Micro-task execution protocol

Execute exactly one task ID from `FRONTEND_TASK_BREAKDOWN.md` per instruction.

Before editing, respond with:
1. Task ID and exact scope.
2. Existing files inspected.
3. Expected files to change.
4. Acceptance checks.

Then implement only that task. Run focused checks appropriate to the changed code. Do not run expensive full-project checks after every tiny task.

At the end, report:
- What was implemented.
- Files created/modified.
- Interactions and states completed.
- Commands actually run and exact results.
- Known defects or incomplete work.
- The next task ID (do not execute it).

Update `docs/FRONTEND_PROGRESS.md` only with verified facts. Never mark a task complete if it was only partially implemented or not tested as required.

If nearing context or usage limits, stop at a safe checkpoint. Update the progress document with exact state, changed files, test results, unresolved work and one next action. Do not attempt to squeeze several tasks into the remaining context.

## Completion definition

The frontend milestone is complete only when every required frontend route and screen exists, important UI interactions work, all key states are represented, mobile/tablet/desktop layouts are checked, and available frontend quality checks have been run and reported honestly. This does **not** mean the product is production-ready or launch-ready; backend, security, legal and operational gates remain separate.
