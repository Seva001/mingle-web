# MINGLE release gates and controlled beta plan

**Status at Batch H handoff: NOT CLEARED FOR STAGING OR PUBLIC BETA.** This document is a gate checklist, not evidence that the checks have already passed.

## Environments

- Keep local, staging and production Supabase projects separate. Never point a preview deployment at production data.
- Use separate Auth redirect allowlists, secrets, storage buckets and transactional-provider credentials per environment.
- Staging must use synthetic test accounts and non-production test data. Never copy real member profiles, messages, reports or identity-verification evidence into staging.
- Production secrets belong only in the hosting provider's encrypted secret store. Never commit `.env.local`, service-role keys, age-assurance secrets or email credentials.
- Use a reviewed migration sequence. Apply migrations to a disposable/local database first, then staging, then production after explicit approval.

## Mandatory go/no-go gates

- [ ] Owner selects and approves the first launch market. MINGLE is international by design; no market is preselected by this package.
- [ ] Qualified local legal review approves age floor, provider-backed age assurance, privacy, terms, consent, retention, deletion, support and consumer-protection obligations for every enabled market.
- [ ] Email confirmation and provider-backed age assurance work end-to-end; unknown, pending, failed and unavailable states fail closed.
- [ ] Every private table and storage bucket has RLS/access policies reviewed. Execute `supabase/tests/rls_inventory.sql` and the two-account authorization test plan.
- [ ] Test anonymous, owner, unrelated member, blocked member, unmatched member, suspended member, support, moderator and administrator roles.
- [ ] Discovery, mutual connection, save/pass/like, block/unmatch, reports, moderation, messages and notification preferences persist correctly.
- [ ] Messaging read/send/realtime authorization is tested after block, unmatch, suspension and account deletion states.
- [ ] No client bundle or public environment variable contains service-role or provider secrets.
- [ ] CI passes: install, security audit, typecheck, lint, tests, format check and production build.
- [ ] Keyboard, screen-reader, zoom, reduced-motion, contrast and mobile accessibility checks pass against `ACCESSIBILITY_QA.md`.
- [ ] Security/dependency review has no unresolved critical/high findings; exceptions are documented, owned and time-bound.
- [ ] Monitoring, alert ownership, support escalation and incident response are staffed and tested.
- [ ] Backup schedule, retention, restore point objective and recovery time objective are approved; a restore drill succeeds.
- [ ] Rollback procedure and migration compatibility are rehearsed in staging.
- [ ] Market support, moderation coverage, abuse escalation and member-contact channels are operational.
- [ ] Owner signs the controlled-beta approval below.

## Controlled beta stages

1. **Internal test:** staff-only accounts; test all role boundaries and safety paths.
2. **Closed beta:** invitation-only adults in the approved market; capped cohort; staffed moderation and daily review. No expansion until incident and support capacity is proven.
3. **Limited release:** gradual cohort increase with daily safety, deliverability, performance and error review.
4. **General availability:** only after explicit owner approval and all market-specific obligations are met.

No stage automatically advances. Pause enrolment immediately on an unresolved critical security issue, failed age gate, unauthorized data exposure, unsafe moderation gap, or inability to restore service/data.

## Approval record

- Approved market(s): ______________________________
- Legal/privacy reviewer and date: ______________________________
- Security reviewer and date: ______________________________
- Operations/support owner: ______________________________
- Backup restore drill reference/date: ______________________________
- Owner go/no-go decision and date: ______________________________
