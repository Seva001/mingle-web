# MINGLE backup and restore plan

**Not configured or tested in this source-only handoff.** Configure backup policies in the chosen Supabase plan and confirm provider retention/point-in-time recovery capabilities before production.

## Data protection scope

Back up PostgreSQL data and schema, migration history, Auth configuration, Storage object metadata and private photo objects, market/legal configuration, and operational configuration needed to recover. Secrets must be recoverable from the approved secret manager, not from database dumps or Git.

## Required decisions

- Database backup frequency and retention: ______________________________
- Point-in-time recovery availability and retention: ______________________________
- Photo/storage backup and integrity verification: ______________________________
- Recovery point objective (maximum acceptable data loss): ______________________________
- Recovery time objective (maximum acceptable outage): ______________________________
- Backup encryption, access roles and geographic/residency constraints: ______________________________
- Backup owner and alert recipient: ______________________________

## Restore drill

1. Restore into an isolated recovery project; never overwrite production during a drill.
2. Apply the documented migration baseline and restore database data and private storage objects.
3. Verify row counts and referential integrity for accounts, profiles, connections, messages, reports and moderation records without exposing their contents.
4. Verify RLS is enabled and policies/grants are present. Test anonymous, owner, unrelated member and staff roles.
5. Verify Auth redirect configuration and server-only secrets are restored from the secret manager.
6. Test sign-in, eligibility, photo access, discovery, block/unmatch, messaging and report workflows using dedicated test accounts.
7. Record actual recovery point and elapsed recovery time against approved objectives.
8. Destroy the isolated recovery project securely after sign-off.

Do not declare backups operational until a restore drill has succeeded and the owner has accepted the measured recovery objectives.
