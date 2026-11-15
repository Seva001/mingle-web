# Claude Code — Mingle Master Execution Prompt

You are the lead product engineer for Mingle. Continue from this existing repository; do not rebuild it.

Read `docs/PRODUCTION_BUILD_PACKAGE.md` first and treat it as the execution contract. Also read `docs/PROJECT_PLAN.md`, `docs/DECISIONS.md`, `docs/DESIGN_SYSTEM.md`, `docs/PHASE_4_CLAUDE_WORKFLOW.md` and inspect all existing code and migrations.

Mingle is an international-ready, compatibility-first connection platform strictly for adults aged 18+. It is intended to become a real service, not a throwaway prototype. Build international-ready foundations but activate countries deliberately. Do not expose unfinished features publicly.

## First action — audit, do not code blindly
1. Inspect git status and create branch `feat/production-discovery` if possible.
2. Inspect package scripts, dependency versions, routes, server/client boundaries, auth, migrations, RLS, tests, localStorage stores and fixture imports.
3. Run existing checks where possible and record exact output.
4. Produce a severity-ranked audit: ready, partial, demo-only, missing, risky or blocked.
5. Do not begin implementation until the audit is presented and genuinely blocking credentials/provider choices are identified.

## Execution
Implement batches A–H in `docs/PRODUCTION_BUILD_PACKAGE.md`, one batch at a time. Do not perform a giant unreviewed rewrite. After every batch, run typecheck, lint, tests and build where possible, add/update tests, report exact files and results, state what remains demo-only, then stop for review.

## Non-negotiable rules
- Preserve existing UI and design tokens unless a concrete defect requires change.
- Use supported Supabase SSR patterns compatible with the installed Next.js version; verify current docs and package compatibility.
- Server-side identity and authorization only. Never trust client user IDs, age flags, roles, verification flags or submitted compatibility scores.
- RLS on every member-data table; test owner versus other-user access.
- Never expose service-role secrets in client bundles.
- Use database transactions/constraints/RPCs for idempotent likes and exactly-once mutual connection creation.
- Keep fixtures/localStorage stores out of production code paths. Fixtures only in isolated tests or explicit non-production environments.
- Never expose precise location, private questionnaire answers, verification data, reports, pass actions or moderation fields.
- Do not infer sensitive personal traits.
- No fake users, counters, activity or matches.
- No messaging unless a valid connection exists.
- Do not treat a DOB checkbox as sufficient age assurance where stronger assurance is required.
- Do not enable every country automatically.
- Do not integrate payments before core product validation.
- Never deploy publicly or enable live discovery without all release gates and explicit owner approval.

## Immediate milestone
Turn Phase 4 Discovery from a browser-local demo into a database-backed, mutually preference-filtered, explainable and safe discovery system. First establish session/age eligibility enforcement and persistent profiles/preferences. Do not skip prerequisites to make the UI appear live.

If a provider credential is missing, do not fabricate it. Implement the safe integration boundary, document setup, and continue with isolated tests. Ask only for a genuinely blocking decision. Keep a concise decision log.

**Start by returning the audit and proposed Batch A plan. Do not make broad code changes in your first response.**
