# Mingle — Frontend Requirements and Acceptance Specification

## 1. Product and experience

Mingle is a compatibility-first platform for adults seeking meaningful connections. The interface should communicate intention, trust, clarity and user control. It must not feel like a generic swipe-app template or use manipulative engagement patterns.

Working tagline: **Meaningful connections. Better matches.**

Brand voice: confident, warm, thoughtful, premium and direct. Avoid exaggerated romantic promises, soulmate claims, false urgency and claims that an algorithm can predict relationship outcomes.

## 2. Design system

`docs/DESIGN_SYSTEM.md` is authoritative. Preserve its shared CSS-variable architecture and both themes.

Core identity:
- Dark background `#09090A`.
- Dark surface `#161617`.
- Brand accent `#FF6A1F`.
- Primary text `#F4F4F6` in dark mode.
- Verified accent `#4C8DFF`.
- Inter Variable, self-hosted.
- Premium dark-first experience with complete light-mode support.
- Photo-led layouts, restrained glass effects, rounded surfaces and restrained motion.

Important: do not hard-code colours in components when a design token exists. Use existing Tailwind token mappings and theme variables. Honour reduced-motion preferences and visible keyboard focus.

## 3. Existing route inventory

These routes already exist in the supplied repository; inspect their real implementation before changing them:

| Route | Existing route file | Frontend target |
|---|---|---|
| `/` | `app/(marketing)/page.tsx` | Complete landing page |
| `/about` | `app/(marketing)/about/page.tsx` | About Mingle |
| `/how-it-works` | `app/(marketing)/how-it-works/page.tsx` | How it works |
| `/help` | `app/(marketing)/help/page.tsx` | Help and FAQ |
| `/privacy` | `app/(marketing)/privacy/page.tsx` | Privacy information / clearly marked draft pending legal review |
| `/terms` | `app/(marketing)/terms/page.tsx` | Terms / clearly marked draft pending legal review |
| `/community-guidelines` | `app/(marketing)/community-guidelines/page.tsx` | Community guidelines |
| `/cookies` | `app/(marketing)/cookies/page.tsx` | Cookie information / preferences UI if in scope |
| `/safety` | `app/(marketing)/safety/page.tsx` | Safety information |
| `/pricing` | `app/(marketing)/pricing/page.tsx` | Pricing presentation; do not imply paid plans are live unless confirmed |
| `/sign-up` | `app/(auth)/sign-up/page.tsx` | Sign-up UI and honest unavailable-service states |
| `/sign-in` | `app/(auth)/sign-in/page.tsx` | Sign-in UI and honest unavailable-service states |
| `/verify` | `app/(auth)/verify/page.tsx` | Email verification explanation / UI |
| `/onboarding` | `app/(member)/onboarding/page.tsx` | Multi-step onboarding and review |
| `/profile` | `app/(member)/profile/page.tsx` | Member profile preview/edit UI |
| `/settings` | `app/(member)/settings/page.tsx` | Account, privacy and preference settings UI |
| `/discover` | `app/(member)/discover/page.tsx` | Clearly labelled synthetic discovery demonstration |
| `/connections` | `app/(member)/connections/page.tsx` | Honest empty/unavailable state unless explicitly using labelled fixtures |
| `/chats` | `app/(member)/chats/page.tsx` | Messaging UI shell; no fake real conversations |
| `/admin` | `app/admin/page.tsx` | Admin UI shell with no fake real operational data |
| `/design-system` | `app/(dev)/design-system/page.tsx` | Development/preview-only design reference; preserve production restriction |

Routes missing from the supplied project but required as frontend interfaces should be added only where appropriate:
- `/contact`
- `/forgot-password`
- `/reset-password`
- `/eligibility`
- `/notifications`

Before adding a route, check for an equivalent existing route or component to avoid duplicates. Preserve route groups and the existing App Router structure.

## 4. Public website requirements

### Landing page

Use the approved product copy and concepts from the archived product handoff, not invented claims. Required sections:
- Responsive marketing header and navigation.
- Hero: “A little more intention. A lot more connection.”
- Clear primary and secondary CTAs.
- Product introduction explaining intentional profiles.
- Three-step “Tell us about yourself / Discover compatibility / Make a connection” section.
- Compatibility explanation and non-guarantee disclaimer.
- Experience/value sections: profiles with personality, discovery with intention, natural conversation starters, user control.
- Trust and safety section.
- Final CTA and complete footer.

### Other public pages

- About: mission, product approach and intended audience.
- How it works: clear sequential explanation of the member journey.
- Help: accessible FAQ accordion/search if useful; answers must not imply unavailable backend operations work.
- Contact: validated form UI. Without a backend, show a truthful demo/unavailable submission state; do not say a message was delivered.
- Privacy, Terms, Community Guidelines, Cookies and Safety: coherent, readable page layouts. Legal/policy copy is draft content and must be marked for legal review; do not claim legal compliance or approval.
- Pricing: if retained, explain only confirmed product decisions; do not invent prices, billing or live subscriptions.

## 5. Authentication and eligibility interfaces

Required interfaces:
- Sign up, sign in, forgot password, reset password, verification, adult eligibility, account success and error states.
- Email/password validation, confirmation, show/hide password, inline errors, disabled/loading states and accessible feedback.
- Navigation between related authentication routes.

No fake authentication. If auth backend is unavailable, forms must clearly state that account operations are not connected. Do not show a successful account creation or password reset unless a real operation reports success. An entered date of birth is not proof of age and must not be presented as verified age assurance.

## 6. Onboarding and member profile

Onboarding should be broken into manageable steps:
1. Personal information.
2. About me / profile introduction.
3. Profile photographs.
4. Interests.
5. Lifestyle preferences.
6. Relationship intentions.
7. Compatibility questionnaire.
8. Discovery preferences.
9. Review.
10. Completion presentation.

Use existing profile types, validation, sanitisation, completion logic and demo-store boundaries. Provide progress, back/continue navigation, validation, photo previews/removal/reordering where supported, character counts, review and unsaved-change feedback.

Profile interfaces should include overview, edit sections, photo management, interests, visibility, privacy preferences and settings. Browser-local demo persistence must be clearly identified as demo-only. Do not call it production persistence.

## 7. Discovery

Required UI:
- Discovery feed and profile cards.
- Full profile view.
- Plain-language compatibility explanations using the existing compatibility engine.
- Like/pass controls and search/filter UI.
- Filter reset and active-filter indicators.
- Loading, empty, no-more-results, error and storage-unavailable states.

Preserve explicit mutual-preference rules and existing compatibility logic. Do not use sensitive traits. Do not call a compatibility score scientific or predictive. All fixture profiles must be visibly labelled synthetic/demo. Local actions are not delivered to another person and do not create real connections.

## 8. Connections and notifications

Connections UI should support overview, cards, details, pending/empty states and navigation. Since real mutual connections do not exist yet, default to an honest empty or unavailable state. Any demonstration data must be clearly labelled and isolated.

Notifications UI should support categories, read/unread presentation, mark-read interactions, empty/loading/error states. Do not imply that notifications are delivered from a server.

## 9. Messaging

Required UI: conversation list, chat view, message bubbles, timestamps, composer, unread presentation, empty/loading/error states, mobile and desktop layouts.

Do not invent real conversations or claim messages are sent. If a local-only composer demonstration is implemented, label it clearly and keep it isolated. Messaging is conceptually intended for valid connections; do not bypass that product boundary.

## 10. Safety and privacy

Required UI: report flow, report categories, optional details, confirmation, block flow, privacy controls and safety information. Forms may demonstrate client-side validation and confirmation UI, but must not claim reports reached moderators or blocking was enforced server-side.

Suggested report categories: fake profile/impersonation, harassment, inappropriate behaviour, suspicious activity, spam, other. Do not collect unnecessary sensitive data.

## 11. Administration

Build an admin interface shell, member list/detail UI, search/filter, report queue/detail, account-status presentation and basic analytics layout only where useful. No fake platform metrics, fake moderation queue or fake admin authentication. Any sample content must be labelled demonstration data. Frontend role checks are not security controls.

## 12. Shared interaction and accessibility requirements

Every visible control must either work or be visibly disabled with a clear explanation. No dead buttons or misleading links.

Required patterns where relevant:
- Client-side validation and clear inline errors.
- Keyboard-accessible menus, dialogs, accordions, tabs and controls.
- Focus management and Escape-to-close for dialogs.
- Visible focus styles and accessible names for icon-only buttons.
- Toasts or inline notices that are announced accessibly.
- Loading, empty, success and error states.
- Responsive mobile navigation.
- Semantic headings, landmarks and labels.
- Reduced-motion support.
- No horizontal overflow at mobile widths.

## 13. Responsive acceptance

Check at least:
- Small mobile: approximately 360–390 CSS px.
- Large mobile: approximately 430 CSS px.
- Tablet: approximately 768 CSS px.
- Desktop: approximately 1280–1440 CSS px.

Review navigation, card widths, image crops, form widths, dialogs, sidebars, bottom navigation and chat layout.

## 14. Frontend acceptance

A feature is complete only when:
- Its intended route renders.
- It reuses the existing architecture and design tokens.
- All visible controls behave appropriately.
- Validation and relevant UI states are covered.
- Keyboard/accessibility basics are addressed.
- Responsive layout is checked.
- Focused checks/tests are run and results recorded.
- No fake backend success or real-world activity is implied.
