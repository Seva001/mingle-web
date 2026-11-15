# Mingle — Batch B implementation notes

Date: 13 November 2026

## Working scope

Batch B is implemented in source as a development-ready integration pass on top of the supplied Pass 3 frontend. The original routes, components, theme tokens and page layouts were preserved; existing authentication forms now submit through server actions rather than local-only preview handlers.

## Implemented

- Supabase browser and server clients using `@supabase/ssr` and typed database definitions.
- Next.js 16 root `proxy.ts` session refresh using `auth.getClaims()` and request/response cookie propagation.
- Cache-safety headers from `@supabase/ssr` 0.10+ are copied to the refreshed response.
- Runtime validation for the public Supabase URL and publishable key. No service-role key is exposed to the browser or used for ordinary member requests.
- Supabase Auth sign-up, sign-in, sign-out, email confirmation callback, resend confirmation, password reset request and password update flows.
- Generic responses for resend/reset to reduce account enumeration.
- A server-side member layout gate that verifies the user with `auth.getUser()`, reads only that account's gate row and denies access on missing configuration, missing rows or query errors.
- Restricted DOB storage, a declared-age floor, market-specific minimum-age check and provider-backed age-assurance state in the corrected account migration.
- New accounts default to `pending`. A trusted database function recalculates eligibility; a database trigger prevents activation unless email is confirmed, provider age assurance passed, the market is enabled and the DOB declaration meets that market's age floor.
- Suspended, underage-blocked and deleted states cannot be silently restored by the eligibility refresh workflow.
- Unit tests for access decisions, declared-age validation and connected auth UI source contracts.

## Intentionally closed / not implemented yet

- No Supabase project or credentials are present in this workspace.
- Migrations have not been applied to any database.
- No age-assurance provider has been selected or integrated. The provider factory deliberately returns `null`; a browser cannot mark itself age-verified.
- No launch market has been approved or enabled. `market_config` starts empty and `accounts.market_code` starts null. This is intentional fail-closed behaviour: no member account can become active yet.
- Batch F source now adds the controlled market allowlist and country-specific policy configuration. The owner must still select and legally review the initial launch market before enabling it.
- Profile, discovery, messaging, notifications, reporting, moderation and admin interfaces remain preview/local-state work until their respective batches.

## Dependency and verification status

The project manifest now declares `@supabase/ssr` `^0.10.0` and `@supabase/supabase-js` `^2.57.0`. The package registry was unreachable from this workspace, so `package-lock.json` could not be regenerated and dependencies could not be installed. **Do not use `npm ci` until the lockfile is regenerated.** On a machine with registry access, run `npm install` once, inspect the resulting lockfile, then run the checks below.

Not run in this workspace:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run format:check`
- `npm run build`
- Browser/device and accessibility checks
- PostgreSQL migration execution and RLS integration tests
- Supabase Auth integration and the full account-state matrix

## Owner setup later (not required during this build phase)

1. Create the dedicated `mingle-dev` Supabase project.
2. Enable Email authentication and email confirmation.
3. Add `http://localhost:3000/auth/callback` to allowed redirect URLs.
4. Copy the Project URL and publishable key into a private `.env.local` at the root of `mingle-web`.
5. Review and apply the migrations in order only to the development project.
6. Keep age assurance and market access closed until a provider and launch market have been approved.

Never paste credentials into chat, Git or screenshots. The service-role key is not required for normal browser/server Auth flows and must never be placed in a `NEXT_PUBLIC_` variable.

## Acceptance status

Batch B source implementation: **implemented, pending dependency/runtime/database verification**.

Batch B production acceptance: **not passed**. No live backend has been connected and no launch claim is made.
