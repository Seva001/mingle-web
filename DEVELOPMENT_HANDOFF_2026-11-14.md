# Mingle development handoff — 14 November 2026

## Changes in this package

- Disabled the unconfigured `/admin` route. It now returns the normal not-found response until Supabase is configured and server-side staff authorization succeeds.
- Confirmed that synthetic discovery fixtures are referenced by tests only; no production discovery route imports them. The fixture module remains isolated for automated tests and is not deleted.
- Removed a misleading “preview” word from the photo-processing API error message.
- Removed the stale `package-lock.json` because its root dependency inventory omitted `@supabase/ssr` and `@supabase/supabase-js`, despite both being required by `package.json`. Keeping that lock would make clean installs unreliable.

## Required first install on the developer machine

Run `npm install` from this directory while connected to the internet. This will resolve the declared dependencies and generate a fresh, synchronized `package-lock.json`. Commit that generated lockfile before using `npm ci` or setting up CI.

## Verification status

- ZIP integrity: to be checked when packaging.
- Static release audit: to be run during packaging.
- Dependency installation, TypeScript, lint, unit tests and production build: not run here. The package registry was unreachable in this environment, so dependency resolution could not be completed.
- Supabase project, migrations, RLS, email delivery, age-assurance provider and production services: not connected or live-tested.

## Important

This is a development handoff package, not a production release. Do not open member registration until provider-backed adult eligibility, authentication, authorization, reporting, blocking and moderation are connected and tested.
