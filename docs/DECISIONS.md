# Decisions, deviations and open items

## Defaults chosen (reversible)

| Decision | Why |
| --- | --- |
| Next.js 16 (App Router), React 19, Tailwind v4 (CSS-first), TypeScript 5 strict, Vitest | Latest stable at 9 Nov 2026; matches brief §9. TypeScript 7 exists but Next tooling targets 5.x. |
| Inter self-hosted via fontsource | No third-party font requests (privacy), works offline. |
| `data-theme` attribute + `@custom-variant dark` | Manual toggle must win over the OS setting. |
| Site is `noindex`, `robots.txt` disallows all, security headers set | Brief §7/§15: no public launch before safety and legal gates. |
| `/design-system` returns 404 in production unless `NEXT_PUBLIC_APP_ENV=preview` | Dev tool, not a product page. |
| Member and admin routes are placeholders with no data | Brief §15: no placeholder flow may look like a production feature. |
| Age gate is layered: declared DOB (18+) is only the first step; `decideMemberAccess` also needs a passed age-assurance outcome and has no off switch | Brief §6: a self-declared date must never be the sole safeguard. With no provider chosen, member access stays closed (fail-closed). |
| Provider and account boundaries (`AuthBackend`, `AgeAssuranceProvider`) return null until configured | Lets the UI and rules be built and tested now; forms say plainly that accounts are off rather than faking success. |
| Under-18 attempt: nothing stored, 24h httpOnly cookie blocks an instant retry | A deterrent only (cookies clear). Real enforcement is age assurance and the database. |
| Date of birth lives in its own table with RLS and no member grants; DB trigger rejects under-18 | Data minimisation and defence in depth. |
| Sign-up never reveals whether an email is registered; sign-in failure is always generic | Prevents account enumeration. Supabase wiring must preserve this. |
| Passwords: 10–128 characters, no composition rules | Length beats forced symbols. Adjust if Supabase Auth settings differ. |
| Phase 3 runs on browser-only demo data behind `demo-store.ts` + `useDemoProfile` | You chose to finish the build first and connect Supabase last. Screens never touch storage directly. |
| Questionnaire has 8 questions across values, lifestyle and communication; no religion, politics, ethnicity or health | Brief §6: don't infer or lean on sensitive traits. Weights stay hypotheses. |
| Gender model is woman / man / non-binary | Placeholder. Needs a product and legal decision (self-describe, per-market rules). |
| Display name may not contain links or `@` | Cuts contact-detail sharing and scam bait at the source. |
| Photos are re-encoded to JPEG (max 900px) before storing | Strips EXIF/GPS and shrinks them. Server-side checks must repeat this in the real app. |
| Repo name `mingle-web` | Brief's suggestion; not yet created on GitHub (needs your account). |

## Deviations from the brief

1. **Text on the orange button is dark, not white.** White on #FF6A1F fails AA (2.9:1).
2. **Focus ring is ink (#171719) in light mode.** Orange is 2.6:1 on #F4F4F1.
3. **Over-photo glass is the same in both themes.** The brief's glass values are for photos; a
   pale glass made white on-photo text illegible in light mode (caught in review).
4. **Light-mode glass and several neutrals are derived** (the brief only gives 6 light tokens).

## Flagged for Phase 2

- 18 is the brief's floor; the age of majority is higher in some countries. Per-country minimums
  belong to the legal review (brief §7).
- The sign-up consent checkbox links to Terms and Privacy pages that are still placeholders.
  Real text must exist before sign-up is enabled.

## Flagged in the brief

- Light muted text on the light background is ~4.3:1 (see DESIGN_SYSTEM.md). Needs an owner decision.
- The brief's weights (25/25/20/15/15) are hypotheses; encoded as such in `lib/compatibility/weights.ts`.

## Open (from brief §17, still unresolved)

Final logo (current mark is provisional) · domain and trademark clearance for "Mingle" · launch
countries/cities and languages · age-assurance provider · privacy/legal counsel · pricing and
payment providers · GitHub repo, Vercel account, Supabase project and who owns them.


## Decision: sign-up without an email code (14 November 2026, owner request)

Members create an account with email and password and sign in straight away, with no email code
or confirmation link. Implemented by turning **Confirm email OFF** in Supabase (Authentication →
Sign In / Providers → Email). Supabase then marks `email_confirmed_at` at sign-up, so the access
rule (`lib/auth/access.ts`) and the database activation guard keep working unchanged. Age
assurance, the enabled launch market and the activation guard are NOT affected: member access
still stays closed until the provider-backed age check passes.

Trade-offs accepted: the email address is not proven to belong to the person, so a mistyped
address cannot receive a password reset, and there is no email-ownership signal against fake
accounts. The age check is the main identity gate. Keep password reset working (needs an email
provider) and consider one-account-per-verified-person checks and sign-up rate limits.


## Decision: no paid age verification (14 November 2026, owner request)

The third-party age-assurance step (ID or face-scan provider) is removed because it costs money the
project does not have. Member access now depends on: a confirmed email (automatic while Confirm email is
OFF), `accounts.status = 'active'`, an enabled launch market, and a declared date of birth that meets the
market minimum (18 floor). The database still rejects under-18 dates of birth and will not activate an
account that has no date of birth on file.

What changed: `lib/auth/age-assurance.ts` and the `/verify` page are deleted; `decideMemberAccess` no longer
takes an age-assurance input; sign-up now redirects to `/onboarding`; migration
`20261114000007_remove_age_assurance_requirement.sql` drops the "active requires passed provider check"
constraint, rewrites the eligibility function and activation guard, fixes `admin_configure_market` (it
required the admin to hold a passed provider outcome, which no one can now), and re-evaluates waiting
accounts. The `age_assurance_*` columns and `verification_records` are left in place, unused.

Trade-offs accepted: a declared date of birth is not proof of age, so a minor can lie. Mitigations that remain
free: the cookie retry-block, the DB 18+ trigger, reporting, moderation and removal of under-18 accounts.
Public copy must never say members are "age-verified" or "age-checked" (rule: no fake age verification).
Revisit before launching in any market whose law requires verified age assurance; the legal review (brief §7)
decides which markets can be enabled. Do not enable such a market in `market_config`.
