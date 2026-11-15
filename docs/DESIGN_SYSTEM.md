# Mingle design system

One component set, two themes. Components read CSS variables from `styles/themes.css`; Tailwind
utilities (`bg-surface`, `text-muted`, …) are mapped to them in `styles/globals.css`. Never
hard-code a hex in a component. Preview everything at `/design-system` (dev/preview only).

## Tokens

| Token | Dark | Light | Source |
| --- | --- | --- | --- |
| background | #09090A | #F4F4F1 | brief |
| surface | #161617 | #FFFFFF | brief |
| foreground | #F4F4F6 | #171719 | brief |
| muted | #8E8E98 | #73737C | brief |
| brand | #FF6A1F | #FF6A1F | brief |
| verified | #4C8DFF | #4C8DFF | brief |
| star | #FFC24B | #FFC24B | brief |
| glass-fill / border | 12% / 18% white | 72% white / 8% ink | dark: brief; light: derived |
| glass-photo fill / border | 12% / 18% white | same | brief values, theme-independent |
| surface-raised | #1F1F21 | #FBFBF9 | derived |
| border | 8% white | 10% ink | derived |
| on-brand | #09090A | #09090A | derived (see accessibility) |
| focus | #FF6A1F | #171719 | derived |
| danger / success | #FF6B6B / #3DD68C | #C62828 / #15803D | derived |

`tests/tokens.test.ts` locks every brief value, so a drift fails the build.

## Theme behaviour

Light / Dark / System. Default **Dark**. Stored in `localStorage["mingle-theme"]`, applied to
`<html data-theme>` by an inline script before first paint (no flash), kept in sync across tabs,
and falls back safely if storage is blocked. Toggle: `components/navigation/theme-toggle.tsx`.

## Type

Inter Variable (self-hosted via `@fontsource-variable/inter`, no Google Fonts request). "Inter
Display" is the same family at optical size 32 (`.font-display`, weight 700, tracking −0.035em).
Scale: caption 13 · body 16 · lead 19 · title 24 · headline 30–44 (fluid) · display 40–76 (fluid).

## Shape and motion

Card radius 28px, control radius 16px, pills and avatars fully round. Motion is limited to press
feedback, toggles and the spinner (120–220ms, ease-out). `prefers-reduced-motion` is honoured globally.

## Components (`components/ui`)

Button / ButtonLink (primary, secondary, glass, ghost, danger; sm/md/lg; loading) · IconButton /
IconLink (accessible name required; glass, photo, surface, ghost) · Card · Field (label, hint, error
wired to ARIA) · Switch · SegmentedControl · Chip (toggle) / Tag · Avatar (ring for new
connections) · VerifiedBadge · CompatibilityBadge (plain-language label, never a percentage) ·
NotificationDot · Logo (provisional). Navigation: BottomNav (mobile floating glass), SideNav
(desktop rail), ThemeToggle. Layout: MemberShell, Container, PhasePlaceholder.

## Accessibility rules baked in

- Visible keyboard focus on everything; skip link on every page; semantic landmarks.
- Selection and verification never rely on colour alone (check marks, inverted fills, labels).
- Orange is a fill, not a text colour on light backgrounds (2.6:1). Text on orange is dark (6.9:1);
  white on orange would be 2.9:1.
- Controls on photos use `glass-photo` + `--photo-scrim` so they stay legible in both themes.
- **Known shortfall in the brief's light palette:** muted `#73737C` on page background `#F4F4F1` is
  ~4.3:1 (AA needs 4.5:1). It passes on white surfaces (4.7:1). Until decided, put light-mode
  muted text on a surface or use ≥18px. Tracked in `tests/tokens.test.ts`.
