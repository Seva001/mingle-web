# Mingle landing-page revision — 14 November 2026

## Requested changes applied

1. The site-wide primary account action now reads **Get Started**.
2. The landing hero has two account actions: **Get Started** and **Create Account**. Both point to the existing `/sign-up` route. The existing sign-in prompt remains directly below: **Already have an account? Sign in here.**
3. The hero headline is now **“Someone wants to mingle with you, find out who.”** The page metadata title was updated to match.
4. Repetitive landing-page copy was shortened in the hero, introduction, how-it-works, compatibility, values, trust/safety and final CTA content. Existing sections, order, anchors, components, navigation, styling tokens and application functionality were left in place.

## Image audit — no images inserted yet

The `public/` folder contained no image assets. The landing page currently uses abstract graphics rather than real photography in these locations:

| Location | Current visual | Suggested image direction |
|---|---|---|
| `components/marketing/hero-visual.tsx` | Tall abstract gradient/overlapping circles with floating labels | Main editorial hero photo: two clearly adult people (roughly 25–35), relaxed candid conversation in a bright modern café or outdoor social setting; natural expressions, inclusive casting, premium lifestyle photography, generous negative space for UI overlay. Avoid wedding imagery or overly staged romantic poses. |
| `components/marketing/compatibility.tsx` (`SharedGroundFigure`) | Abstract overlapping circles | Wide supporting photo: two clearly adult people enjoying a shared activity or conversation, framed with open space; could alternatively remain an infographic if the section needs to explain compatibility rather than evoke romance. |

### Optional image opportunities (not current empty placeholders)

- The `How Mingle is designed to work` section currently uses text/cards and icons. A small four-image sequence could be considered later, but is not required for this pass.
- The `Experience` and `Trust & Safety` sections use icons/cards; no photo slot is currently present. Keep them as-is unless a later visual review shows a clear need.

## Preservation notes

- No member, authentication, profile, discovery, messaging, moderation, admin, backend, database, route, colour, typography, spacing or responsive-layout code was intentionally changed.
- No external image URL or stock image was added.
- The two hero buttons intentionally share `/sign-up`; the sign-in link remains `/sign-in`.
- Sign-up is still unavailable in the current project state. Existing account-availability notices were retained so the revised buttons do not imply registration is operational.

## Verification status

- Source-level review completed.
- Automated tests were not run: dependency installation (`npm ci --ignore-scripts --no-audit --no-fund`) timed out in this environment.
- Run `npm ci`, then `npm run check` on the development PC before merging or publishing.
