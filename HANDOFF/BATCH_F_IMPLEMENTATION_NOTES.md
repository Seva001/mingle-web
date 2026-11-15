# Batch F implementation notes — international readiness

Date: 13 November 2026

## Implemented in source

- Added `20261110000005_international_readiness.sql` after Batch E.
- Extended `market_config` with a display name, market-specific minimum age (within the existing 18–99 discovery-age range), supported locales, default locale, IANA timezone, terms/privacy policy version identifiers, required provider-backed age-assurance policy marker, cross-market discovery switch and a reviewed retention-days field.
- **No market is seeded or enabled.** Signup exposes only markets returned by the enabled-market RPC. New market records default disabled. The admin-only `admin_configure_market` RPC is the intended staff workflow; the first market must be provisioned by the trusted project owner through the SQL/service-role workflow because no active market admin exists yet. The project owner/legal reviewer must choose the initial launch market and provide the reviewed policy values.
- Signup now requires an enabled two-letter market code. The server verifies the selected market and checks the market-specific minimum age (within the existing 18–99 discovery-age range); the auth-user database trigger independently rejects disabled/unknown markets, missing terms/privacy acknowledgements and unsupported market metadata. Email confirmation and provider-backed age assurance remain separate gates.
- Signup records the exact terms and privacy policy version identifiers and locale accepted at account creation in a restricted consent table. No member/browser table grants are provided for consent records.
- Accounts store locale and timezone separately from the immutable signup market. Members can update locale/timezone only through a server action and database RPC that validate against the market's enabled locale list and PostgreSQL's IANA timezone catalog.
- Profile country is now derived from the account's configured market display name by a database trigger; members cannot claim a different country through the profile form. City/area remains coarse text only; no precise coordinates or address are collected.
- Discovery, likes and saved-profile writes now require same-market membership unless **both** markets explicitly enable cross-market discovery. This prevents accidental global discovery during a single-market launch.
- Added locale-aware date/time formatting helpers and connected the Connections timestamp to the member's stored locale/timezone.
- Added market-specific declared-age validation tests, locale/timezone formatting tests and static SQL/security contract tests.

## Intentionally not completed / launch dependencies

- The first launch market is deliberately not chosen by this implementation. The owner and qualified local counsel must select the market and review minimum age, provider-backed age assurance method, terms, privacy policy, consent wording and retention requirements before configuring it.
- `retention_days` is policy metadata only in this batch. Automated retention/deletion jobs, export/deletion workflows and consent renewal/re-consent flows remain to be implemented/reviewed before launch.
- `age_assurance_policy` is deliberately restricted to `provider_required`; no provider has been selected or integrated. Batch B's provider boundary remains fail-closed.
- Existing legal pages remain draft material and have not received jurisdiction-specific legal review.
- Locale/timezone storage and the Connections date label are wired. Full translation of every UI string, localized emails, currency, phone-number handling, and translated legal documents are not included.
- Cross-market discovery is off by default and should remain off until product/legal review explicitly approves it.
- Market admin configuration is available through a role-checked RPC; a dedicated market-management UI is not included. The initial market can also be provisioned through the trusted SQL/service-role workflow after review.

## Verification status

- Static source contracts and local import scan are included in the implementation pass.
- Package installation is unavailable in this environment; TypeScript, ESLint, Vitest and Next production build remain unverified.
- SQL has not been applied or parsed by a live PostgreSQL/Supabase instance. Trigger ordering, RPC grants, timezone catalog validation, RLS and cross-market behaviour require testing in a disposable development project.
- No Supabase project has been created and no market is enabled. This batch is not production-ready.
