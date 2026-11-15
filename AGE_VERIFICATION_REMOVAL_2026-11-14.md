# Age verification removed — 14 November 2026

Paid third-party age assurance is out. The declared date of birth (18+, per-market minimum) stays.

Deleted: lib/auth/age-assurance.ts, app/(auth)/verify/, components/forms/verification-status.tsx,
AGE_ASSURANCE_* in .env.example.
Changed: lib/auth/access.ts, member-access.ts, actions.ts, backend.ts, form-state.ts, eligibility.ts,
app/auth/callback/route.ts, app/(member)/layout.tsx, app/(auth)/eligibility/page.tsx, sign-up form,
profile steps, admin overview, market settings, and every public page that promised an "age check".
Added: supabase/migrations/20261114000007_remove_age_assurance_requirement.sql (also activates eligible accounts at sign-up), tests/age-model.test.ts.
Apply migration 7 to the Supabase project (after 1–6). Not applied by this package.
Rule that still holds: never describe members as "age-verified".
