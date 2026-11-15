# MINGLE — COMPLETE FRONTEND IMPLEMENTATION

We are continuing the existing Mingle project. Our immediate milestone is to complete the entire frontend before beginning backend integration.

You must work inside the existing repository. Do not create a new project or rebuild the application from scratch.

## 1. Read the project documentation

Before coding, read:
- `docs/CLAUDE_MASTER_EXECUTION_PROMPT.md`
- `docs/PRODUCTION_BUILD_PACKAGE.md`
- `docs/INITIAL_PRODUCTION_AUDIT.md`

Inspect the existing source code and identify the current implementation of every route and component.

Preserve existing working functionality and Mingle's approved visual identity.

## 2. Design system

Maintain the established Mingle identity:
- Background: #09090A
- Surface: #161617
- Accent: #FF6A1F
- White primary text
- Inter typography
- Verified-blue accents
- Premium dark interface
- Photo-led layouts
- Subtle glassmorphism
- Minimal orange accents

Prioritise mobile-first design while ensuring excellent tablet and desktop responsiveness.

## 3. Complete every frontend section

**A. Public website**
- Landing page
- About Mingle
- How it works
- Help and FAQ
- Contact
- Privacy policy
- Terms of service
- Community guidelines

**B. Authentication and eligibility interfaces**
- Sign up
- Sign in
- Forgot password
- Password reset
- Email verification
- Age eligibility interface for adults aged 18+
- Account creation success and error states

**C. Member onboarding**
- Profile creation
- Profile photographs
- Personal information
- Interests and lifestyle
- Relationship intentions
- Compatibility questionnaire
- Onboarding progress
- Review and completion

**D. Member profile**
- Profile viewing
- Profile editing
- Photo management
- Interest management
- Visibility and privacy preferences
- Account settings

**E. Discovery**
- Discovery feed
- Member profile cards
- Full profile view
- Compatibility explanations
- Like and pass interactions
- Search and filtering
- Loading, empty and error states

**F. Connections**
- Connections dashboard
- Mutual connection cards
- Connection details
- Pending interaction states
- Empty states

**G. Messaging**
- Conversation list
- Individual chat interface
- Message bubbles
- Timestamps
- Message composer
- Empty conversations
- Loading and error states
- Unread message indicators

**H. Notifications**
- Notification centre
- Notification categories
- Read and unread states
- Empty states

**I. Safety**
- Block member interface
- Report member flow
- Report categories
- Confirmation dialogs
- Safety information
- Privacy controls

**J. Administration**
- Admin dashboard interface
- Member management
- Reports and moderation queue
- Account status management
- Basic analytics presentation
- Empty, loading and error states

## 4. Interaction requirements

Do not build static screens only. Every visible button, navigation item, menu, tab, form, modal, filter and interactive card must have an appropriate working frontend interaction.

Implement:
- Form validation
- Navigation between screens
- Modal interactions
- Confirmation dialogs
- Toast notifications
- Loading indicators
- Empty states
- Error states
- Success states
- Responsive navigation
- Accessible keyboard interactions

Use clearly separated mock data and frontend state where backend services are not yet available.

IMPORTANT:
- Never present mock users as genuine registered members.
- Never fabricate real activity, messages or matches.
- Clearly isolate development fixtures from production data.
- Do not implement fake authentication or claim that frontend age checks provide real age assurance.

## 5. Technical requirements

- Preserve the existing Next.js architecture.
- Continue using TypeScript and the existing Tailwind setup.
- Reuse existing components where appropriate.
- Create reusable components for repeated UI patterns.
- Avoid unnecessary dependencies.
- Keep the application organised and maintainable.
- Do not expose secrets or API keys.
- Do not introduce unnecessary backend changes during this phase.

## 6. Quality assurance

After implementation:
- Check every application route.
- Check mobile, tablet and desktop layouts.
- Test every important interactive flow.
- Check forms and validation.
- Check navigation and modal behaviour.
- Run available linting and tests.
- Run TypeScript checks.
- Run a production build where dependencies permit.
- Fix errors introduced by your changes.

Do not claim tests passed unless they actually ran successfully.

## 7. Implementation workflow

Work in logical batches, but continue through all frontend sections.

For each batch:
1. Explain the screens being implemented.
2. Implement them in the existing repository.
3. Test the changes.
4. Fix errors.
5. Summarise completed work and remaining issues.

Do not stop after producing another implementation plan.

If you encounter a genuine blocker, explain it and continue with independent frontend work.

## FINAL ACCEPTANCE CRITERIA

The frontend milestone is complete only when:
- Every required screen exists.
- Every route renders correctly.
- All important interactions work.
- All major user journeys can be navigated.
- Responsive layouts are complete.
- Loading, empty, success and error states are covered.
- No major placeholder screens remain.
- The project passes the available code-quality checks.

At the end, provide a complete frontend completion report listing implemented routes, components, interactions, tests, known limitations and remaining backend dependencies.

Our goal is a production-quality frontend ready for Supabase integration, not a visual prototype.

Begin by inspecting the repository and then implement the frontend.
