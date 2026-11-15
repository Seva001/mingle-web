# Mingle — Frontend QA Checklist

Use this during feature work and the final integration phase. Record actual results; do not tick an item based on visual assumption.

## Routes and navigation
- [ ] Every required route renders without runtime errors.
- [ ] Internal navigation links resolve to the intended route.
- [ ] Back/forward navigation behaves sensibly.
- [ ] Unknown routes show the intended not-found page.
- [ ] No dead buttons, inert links or misleading actions remain.

## Interaction and state
- [ ] Forms validate required and malformed values.
- [ ] Error messages are clear and associated with fields.
- [ ] Loading states prevent duplicate submissions where appropriate.
- [ ] Success messages only describe actual local UI outcomes.
- [ ] Empty and unavailable states explain what is unavailable.
- [ ] Dialogs open, close, handle Escape and manage focus.
- [ ] Tabs, accordions, filters and menus work with keyboard and pointer.
- [ ] Destructive actions have clear confirmation UI.

## Data integrity
- [ ] Fixtures are visibly labelled synthetic/demo.
- [ ] No fabricated registered members, matches, messages, notifications or analytics.
- [ ] No UI claims server delivery, account creation, age verification or moderation enforcement without a real backend result.
- [ ] No secrets or credentials in client code.
- [ ] Existing noindex/robots restrictions remain in place.

## Accessibility
- [ ] Semantic headings and landmarks.
- [ ] Form labels and descriptions are programmatically associated.
- [ ] Icon-only controls have accessible names.
- [ ] Visible keyboard focus.
- [ ] Dialog focus management and Escape handling.
- [ ] Status messages announced accessibly.
- [ ] Reduced-motion preference respected.
- [ ] Colour is not the only way state is communicated.

## Responsive
- [ ] 360–390px mobile.
- [ ] 430px mobile.
- [ ] 768px tablet.
- [ ] 1280–1440px desktop.
- [ ] No horizontal overflow.
- [ ] Images crop intentionally and do not distort.
- [ ] Navigation, dialogs, forms, cards and chat remain usable.

## Code quality
- [ ] Focused tests run after each feature.
- [ ] TypeScript check run at final QA.
- [ ] Lint run at final QA.
- [ ] Unit tests run at final QA.
- [ ] Production build run where dependencies permit.
- [ ] Exact command output/results recorded.
