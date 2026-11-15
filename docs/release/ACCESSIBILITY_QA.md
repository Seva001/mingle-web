# MINGLE accessibility QA checklist

Target: WCAG 2.2 AA. Automated checks supplement, but do not replace, manual testing with keyboard and assistive technology.

## Required manual checks

- [ ] Complete every public, auth, onboarding, profile, discovery, connection, chat, notification, settings, report and admin task using keyboard only.
- [ ] Focus order follows visual/reading order; focus is always visible and never trapped except in a correctly managed modal.
- [ ] Every control has an accessible name, role and state. Icon-only buttons have meaningful labels; decorative icons are hidden from assistive technology.
- [ ] Headings and landmarks are hierarchical and unique enough to navigate. Skip link reaches the main content.
- [ ] Forms have persistent labels, instructions, required-state cues and errors associated with the relevant fields; errors are announced without relying on color.
- [ ] Status changes (saved, sent, failed, unread) are announced using appropriate live-region semantics without excessive announcements.
- [ ] Text contrast meets 4.5:1 for normal text and 3:1 for large text; controls/focus indicators meet applicable non-text contrast.
- [ ] Layout remains usable at 200% zoom and at 320 CSS px width without two-dimensional scrolling for ordinary content.
- [ ] Touch targets meet WCAG 2.2 target-size requirements or documented exceptions.
- [ ] Motion respects `prefers-reduced-motion`; no flashing content.
- [ ] Images have useful alternative text where informative; decorative images have empty alt text.
- [ ] Chat timestamps and status are understandable when read by screen readers; messages are not conveyed by color alone.
- [ ] Locale changes do not break text expansion, date/time rendering, reading order or keyboard operation.

## Test matrix

Record browser/OS, screen reader, tester, date, route, result and defects. At minimum test current Chrome + NVDA on Windows, Safari + VoiceOver on iOS/macOS, Firefox keyboard-only, and a narrow mobile viewport. Add other major browsers used by the intended international audience before beta.

## Defect policy

Block release for critical task blockers, keyboard traps, inaccessible age/consent/reporting flows, or defects that prevent a member from blocking/reporting another account. Track lower-severity defects with owner and target date.
