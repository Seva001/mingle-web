# MINGLE incident response runbook

This is an operational template. Assign named on-call owners and test it before any beta; it is not proof that monitoring or response coverage is active.

## Severity

- **SEV-1:** confirmed or strongly suspected unauthorized access to private member data; age-gate bypass; service-role/provider-secret exposure; widespread account takeover; critical safety/moderation failure.
- **SEV-2:** major outage, sustained auth/messaging failure, notification delivery failure affecting safety workflows, or significant abuse spike.
- **SEV-3:** limited feature degradation without evidence of private-data exposure or immediate member-safety risk.

## First response

1. Record detection time, affected environment, symptoms, reporter and incident commander. Use an incident ID; do not copy message bodies, DOBs, identity evidence or report narratives into general chat channels.
2. Preserve relevant security logs and deployment/migration identifiers. Restrict access to evidence to the incident response group.
3. For suspected compromise, stop risky writes or disable the affected feature; revoke compromised sessions/keys and rotate secrets using provider procedures. Never paste secrets into tickets.
4. For data exposure, preserve evidence, identify affected tables/storage paths and time window, contain access, and engage privacy/legal leadership immediately.
5. For age assurance or moderation failure, pause new registrations or the affected market/feature until the fail-closed path is verified.
6. Communicate through the approved incident owner. Legal/privacy leadership determines regulator and member notification obligations and deadlines for each affected jurisdiction.
7. Recover only after a peer-reviewed fix, staging verification and explicit incident commander approval.

## Recovery and closure

- Verify authorization boundaries with at least two accounts and relevant staff roles.
- Confirm no secrets remain exposed; rotate credentials and invalidate sessions where appropriate.
- Reconcile data integrity and queued jobs; do not replay unsafe or duplicate notifications blindly.
- Document timeline, scope, root cause, containment, member impact, legal decisions, recovery and follow-up owners.
- Create corrective actions with owners and due dates. Run a blameless post-incident review.

## Required contacts to fill before launch

- Incident commander/on-call: ______________________________
- Security lead: ______________________________
- Privacy/legal lead: ______________________________
- Safety/moderation lead: ______________________________
- Hosting/Supabase escalation: ______________________________
- Member support contact: ______________________________
