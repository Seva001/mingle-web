# Mingle — Frontend Micro-Task Breakdown

Execute one task ID at a time, in order, unless inspection proves a task is already complete. Verify existing implementation before editing. Each task should normally affect one component or one tightly related screen; split further if scope grows.

## Phase 0 — Inspect and prepare

- [ ] **F0.1** Inspect repository tree, package scripts, Next/React/TS/Tailwind versions and current working tree. No application edits.
- [ ] **F0.2** Read active frontend docs and audit; identify the actual existing route/component map.
- [ ] **F0.3** Inspect current shared UI primitives and identify duplicates/gaps. No edits.
- [ ] **F0.4** Create/verify progress tracking and a clean backup/checkpoint. No broad refactor.

## Phase 1 — Shared UI foundation

- [ ] **F1.1** Audit design tokens and theme use; fix only proven inconsistencies.
- [ ] **F1.2** Button and icon-button states/accessibility.
- [ ] **F1.3** Form field, textarea, validation and helper/error presentation.
- [ ] **F1.4** Card, surface, badge and tag consistency.
- [ ] **F1.5** Reusable modal/dialog with focus, Escape and keyboard behaviour.
- [ ] **F1.6** Toast/notice component and accessible announcements.
- [ ] **F1.7** Loading/skeleton and empty-state components.
- [ ] **F1.8** Error-state component and retry presentation.
- [ ] **F1.9** Responsive navigation primitives and mobile menu behaviour.
- [ ] **F1.10** Shared UI responsive/accessibility spot-check.

## Phase 2 — Public website

- [ ] **F2.1** Marketing header: links, active/focus states and mobile menu.
- [ ] **F2.2** Marketing footer: complete link groups and responsive layout.
- [ ] **F2.3** Landing hero section and CTA behaviour.
- [ ] **F2.4** Landing introduction and product proposition section.
- [ ] **F2.5** Landing how-it-works section. _Implemented and statically/partly verified in the consolidated F2.5 package (see FRONTEND_PROGRESS.md); not ticked until runtime checks pass._
- [ ] **F2.6** Landing compatibility explanation and disclaimer. _Delivered inside the consolidated F2.5 package by instruction; not ticked until runtime checks pass._
- [ ] **F2.7** Landing experience/value sections. _Delivered inside the consolidated F2.5 package by instruction; not ticked until runtime checks pass._
- [ ] **F2.8** Landing trust/safety section and final CTA. _Delivered inside the consolidated F2.5 package by instruction; not ticked until runtime checks pass._
- [ ] **F2.9** Landing page composition, responsive and link audit. _Not started. Needs a browser._
- [ ] **F2.10** About page. _Implemented and statically/partly verified (see FRONTEND_PROGRESS.md); not ticked until runtime checks pass._
- [ ] **F2.11** How It Works page. _Implemented and statically/partly verified (see FRONTEND_PROGRESS.md); not ticked until runtime checks pass._
- [ ] **F2.12** Help page structure and content. _Implemented and statically/partly verified (see FRONTEND_PROGRESS.md); not ticked until runtime checks pass._
- [ ] **F2.13** FAQ accordion interactions/accessibility. _Implemented and statically/partly verified (see FRONTEND_PROGRESS.md); keyboard and screen-reader behaviour still needs a browser; not ticked until runtime checks pass._
- [ ] **F2.14** Contact page layout and fields. _Preview route and form implemented 13 Nov 2026; runtime verification outstanding._
- [ ] **F2.15** Contact form validation and truthful unavailable/success UI states. _Local validation and no-delivery state implemented 13 Nov 2026; tests/runtime verification outstanding._
- [ ] **F2.16** Privacy page layout and clearly marked draft content. _Draft content and legal-review warning implemented 13 Nov 2026; operator-specific processing details remain unknown._
- [ ] **F2.17** Terms page layout and clearly marked draft content. _Draft framework and legal-review warning implemented 13 Nov 2026; counsel review required._
- [ ] **F2.18** Community Guidelines page. _Guidelines content implemented 13 Nov 2026; moderation operations are not connected._
- [ ] **F2.19** Safety page review/completion. _Safety guidance and report entry point implemented 13 Nov 2026; production reporting/support are not connected._
- [ ] **F2.20** Cookies page review/completion. _Browser-storage explanation implemented 13 Nov 2026; full production inventory and consent manager remain outstanding._
- [ ] **F2.21** Pricing page review; remove unsupported live pricing claims. _No-pricing/not-available state implemented 13 Nov 2026._
- [ ] **F2.22** Public routes/navigation/responsive audit.

## Phase 3 — Authentication and eligibility UI

- [ ] **F3.1** Sign-up screen layout. _Existing screen retained; confirm-password and password visibility added 13 Nov 2026._
- [ ] **F3.2** Sign-up validation, password visibility and honest unavailable state. _Local-only validation and no-account-created state implemented 13 Nov 2026; verification outstanding._
- [ ] **F3.3** Sign-in screen layout. _Existing screen retained; forgot-password navigation and visibility added 13 Nov 2026._
- [ ] **F3.4** Sign-in validation and honest unavailable state. _Local-only validation and no-account-accessed state implemented 13 Nov 2026; verification outstanding._
- [ ] **F3.5** Forgot-password screen. _Route and local email validation implemented 13 Nov 2026; verification outstanding._
- [ ] **F3.6** Reset-password screen and validation states. _Route, local validation and missing-link state implemented 13 Nov 2026; verification outstanding._
- [ ] **F3.7** Email verification screen and resend UI. _Pending/status/resend UI implemented 13 Nov 2026; verification outstanding._
- [ ] **F3.8** Adult eligibility screen; explicitly distinguish declared DOB from verified age assurance. _Static eligibility boundary screen implemented 13 Nov 2026; verification outstanding._
- [ ] **F3.9** Account success/error presentation without fabricated success.
- [ ] **F3.10** Auth route and responsive journey audit.

## Phase 4 — Onboarding

- [ ] **F4.1** Onboarding shell, step routing and progress indicator. _Existing shell, query-step routing and progress indicator found in F2.13 package; runtime QA outstanding._
- [ ] **F4.2** Personal information step. _Existing local-demo step found; runtime QA outstanding._
- [ ] **F4.3** About-me step. _Existing local-demo step found; runtime QA outstanding._
- [ ] **F4.4** Photo upload/selection UI. _Existing photo manager found; runtime QA outstanding._
- [ ] **F4.5** Photo preview, removal and ordering UI. _Existing photo manager found; runtime QA outstanding._
- [ ] **F4.6** Interests step. _Existing local-demo step found; runtime QA outstanding._
- [ ] **F4.7** Lifestyle preferences step. _Existing options/step components found; runtime QA outstanding._
- [ ] **F4.8** Relationship intentions step. _Existing local-demo step found; runtime QA outstanding._
- [ ] **F4.9** Compatibility questionnaire step and explanatory copy. _Existing questionnaire step found; runtime QA outstanding._
- [ ] **F4.10** Discovery preferences step. _Existing local-demo step found; runtime QA outstanding._
- [ ] **F4.11** Review step. _Profile overview already provides a local completion summary and section-by-section edit links; explicit final review in the onboarding sequence still needs owner decision/runtime QA._
- [ ] **F4.12** Completion presentation with truthful demo-state wording. _Profile overview now states when local demo setup is complete and clarifies that no account is created or verified._
- [ ] **F4.13** Onboarding validation, navigation and responsive audit.

## Phase 5 — Member profile and settings

- [ ] **F5.1** Profile overview presentation. _Existing local-demo profile overview found; runtime QA outstanding._
- [ ] **F5.2** Profile edit personal details. _Existing onboarding steps are reused for editing; dedicated profile route QA outstanding._
- [ ] **F5.3** Profile photo management. _Existing photo manager found; runtime QA outstanding._
- [ ] **F5.4** Interests and lifestyle editing.
- [ ] **F5.5** Relationship intentions editing.
- [ ] **F5.6** Visibility preferences UI. _Existing profile overview includes a local-only discovery visibility switch; runtime QA outstanding._
- [ ] **F5.7** Privacy controls UI. _Settings links to privacy and safety information; actual account privacy enforcement remains unavailable._
- [ ] **F5.8** Account settings UI. _Appearance, preview notification preferences and profile/safety links implemented 13 Nov 2026; account controls remain unavailable._
- [ ] **F5.9** Unsaved-change and local-demo persistence feedback.
- [ ] **F5.10** Profile/settings route audit.

## Phase 6 — Discovery

- [ ] **F6.1** Discovery page structure and responsive shell. _Existing discovery experience found; runtime QA outstanding._
- [ ] **F6.2** Discovery profile card. _Existing synthetic profile card found; runtime QA outstanding._
- [ ] **F6.3** Profile photo presentation and photo controls.
- [x] **F6.4** Full profile detail view. _Inline detail panel now exposes the synthetic profile bio, location, interests and relationship intention; runtime QA outstanding._
- [ ] **F6.5** Compatibility badge and plain-language explanation. _Existing compatibility explanation and exploratory score remain in the discovery card; runtime QA outstanding._
- [ ] **F6.6** Like interaction in isolated demo state. _Existing local-only Interested action retained; runtime QA outstanding._
- [ ] **F6.7** Pass interaction in isolated demo state. _Existing local-only Pass action retained; runtime QA outstanding._
- [ ] **F6.8** Search UI. _Local search by display name, city, country and interests implemented 13 Nov 2026; runtime QA outstanding._
- [x] **F6.9** Filter controls and filter modal/drawer. _Advanced filter panel supports an adult-only (18+) age range, location, intention and interest using local fixture data; runtime QA outstanding._
- [x] **F6.10** Applied-filter display and reset. _Advanced filters expose clear-all and update results immediately; a dedicated applied-filter chip summary remains a future refinement._
- [ ] **F6.11** Loading/skeleton state.
- [ ] **F6.12** Empty/no-more-results/error/storage-failure states.
- [ ] **F6.13** Discovery integrity, responsive and interaction audit.

## Phase 7 — Connections

- [ ] **F7.1** Connections page/dashboard shell. _Preview page implemented 13 Nov 2026; no real mutual connections are claimed._
- [ ] **F7.2** Connection card component (only for clearly labelled demo data if used). _Local interest-signal cards implemented 13 Nov 2026; explicitly not mutual connections._
- [ ] **F7.3** Connection detail presentation.
- [ ] **F7.4** Pending interaction state.
- [ ] **F7.5** Honest empty/unavailable state; no invented mutual connections. _Implemented 13 Nov 2026._
- [ ] **F7.6** Connections navigation and responsive audit.

## Phase 8 — Notifications

- [ ] **F8.1** Notification centre layout. _Empty notification centre implemented 13 Nov 2026; delivery is not connected._
- [x] **F8.2** Notification item component and categories. _Fictional sample items and All/Matches/Messages/Safety/Account filters implemented; no delivery is claimed._
- [x] **F8.3** Read/unread presentation. _Unread dots/counts and read labels implemented for local preview items._
- [x] **F8.4** Local demonstration mark-read interactions, if used. _Individual and mark-all-read interactions implemented in page state; refresh resets them._
- [ ] **F8.5** Empty/loading/error states and truthful delivery boundary. _Honest empty/unavailable state implemented 13 Nov 2026; loading/error states require service integration._
- [ ] **F8.6** Notifications route and responsive audit.

## Phase 9 — Messaging

- [x] **F9.1** Conversation list layout and empty state. _Tinder-style match-preview strip, searchable conversation list and unread filter implemented with clearly labelled fictional fixtures._
- [x] **F9.2** Conversation item component; no fabricated real chats. _Conversation rows show avatar, name, preview, timestamp and unread state; all records are synthetic._
- [x] **F9.3** Individual chat layout. _Responsive split-pane chat detail with mobile back navigation implemented._
- [x] **F9.4** Message bubble and timestamp presentation. _Incoming/outgoing sample bubbles, timestamps and local read indicators implemented._
- [x] **F9.5** Composer UI and client-side validation. _Composer trims empty messages and enforces a 1,000-character maximum._
- [x] **F9.6** Local-only send demonstration only if clearly labelled; otherwise disabled/unavailable state. _Send adds a message to temporary component state only and explicitly says it was not sent or stored._
- [x] **F9.7** Unread/loading/error/empty states. _Unread filter, no-results state, initial empty-selection state and local status notices implemented; network loading/error states remain backend-dependent._
- [x] **F9.8** Mobile and desktop chat responsive audit. _Responsive layout and mobile conversation back control implemented; real-device/browser audit remains in Phase 12._

## Phase 10 — Safety and privacy UI

- [ ] **F10.1** Safety centre layout/content. _Safety centre guidance implemented 13 Nov 2026._
- [ ] **F10.2** Report-member dialog. _Standalone report form implemented 13 Nov 2026; it is not connected to a member record or moderation service._
- [ ] **F10.3** Report categories and details validation. _Local category and minimum-detail validation implemented 13 Nov 2026._
- [ ] **F10.4** Report confirmation that does not claim server delivery. _Local validation outcome explicitly says no report was sent or stored._
- [x] **F10.5** Block-member dialog and confirmation that does not claim server enforcement. _Accessible confirmation dialog added; action affects synthetic fixtures in this browser only. Real enforcement remains unavailable._
- [ ] **F10.6** Privacy settings integration. _Settings links to privacy/safety information; actual privacy settings and enforcement remain outstanding._
- [ ] **F10.7** Safety flow accessibility and responsive audit.

## Phase 11 — Administration UI

- [x] **F11.1** Admin shell and navigation. _Non-operational admin workspace navigation added for Overview, Members, Verification, Moderation, Reports and Audit; no admin authentication or data is connected._
- [x] **F11.2** Overview cards with no invented live metrics. _Overview section explains required service dependencies; no metrics are fabricated._
- [x] **F11.3** Analytics presentation using clearly labelled sample data or empty state. _Explicit no-live-data state; no invented analytics are displayed._
- [x] **F11.4** Member list/search/filter UI. _Member workspace section and searchable requirement checklist implemented; member records are intentionally unavailable._
- [x] **F11.5** Member detail presentation. _Member-detail requirements and unavailable state are presented; no real member detail is exposed._
- [x] **F11.6** Account status presentation; no actual enforcement. _Account status workflow dependencies are documented in the Members section; no status can be changed._
- [x] **F11.7** Moderation queue empty/demo state. _Moderation workspace explicitly reports no connected queue or cases._
- [x] **F11.8** Report detail and action confirmation UI. _Reports section documents required report detail and resolution workflow; no report records or enforcement actions are fabricated._
- [x] **F11.9** Admin route responsive/accessibility audit. _Responsive navigation and semantic section controls added; final browser/accessibility audit remains in Phase 12._

## Phase 12 — Final frontend integration and QA

- [ ] **F12.1** Full route inventory and missing-route check.
- [ ] **F12.2** Public-site navigation and dead-link audit.
- [ ] **F12.3** Authentication and eligibility journey audit.
- [ ] **F12.4** Onboarding/profile journey audit.
- [ ] **F12.5** Discovery journey audit.
- [ ] **F12.6** Connections/notifications journey audit.
- [ ] **F12.7** Messaging/safety journey audit.
- [ ] **F12.8** Admin interface audit.
- [ ] **F12.9** Mobile layout audit.
- [ ] **F12.10** Tablet layout audit.
- [ ] **F12.11** Desktop layout audit.
- [ ] **F12.12** Keyboard and accessibility spot-check.
- [ ] **F12.13** TypeScript check.
- [ ] **F12.14** Lint check.
- [ ] **F12.15** Unit tests.
- [ ] **F12.16** Production build.
- [ ] **F12.17** Fix remaining frontend defects and rerun affected checks.
- [ ] **F12.18** Final frontend completion report and backend dependency list.

## Task sizing rule

If a task requires more than a small, focused change, split it into sub-IDs before editing (for example `F2.3a`, `F2.3b`). Never turn a task into a multi-page rewrite just to finish a phase quickly.
