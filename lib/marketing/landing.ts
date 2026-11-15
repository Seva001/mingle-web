import { authLinks } from "@/lib/site";

/**
 * Copy for the landing sections added in F2.5: how it works, compatibility, values and
 * experience, trust and safety, and the closing call to action.
 *
 * Kept as plain data so tests can enforce the messaging rules (brief §6, §15): no guarantees,
 * no statistics, testimonials or member counts, no percentages, no sensitive traits used for
 * compatibility, and no safety feature described as live before it exists.
 *
 * Tense matters. Everything about the member journey is written as intent ("you’ll", "is
 * designed to"), because accounts, reporting and moderation are not operational
 * yet (`getAuthBackend()` returns null until it is configured).
 */

/* ------------------------------------------------------------------ how it works */

export type StepKey = "account" | "profile" | "discover" | "connect";

export const howItWorks = {
  id: "how-it-works",
  title: "How Mingle is designed to work",
  lead: "Create an account, set up your profile, discover people and connect when interest is mutual.",
  steps: [
    {
      key: "account",
      title: "Create your account",
      body: "Sign up with your email, a password and your date of birth. Your date of birth is a declaration that you’re 18 or over.",
      details: ["Email and password", "Date of birth", "Adults only"],
    },
    {
      key: "profile",
      title: "Share who you are and what you’re looking for",
      body: "Add photos, a short bio and what matters to you.",
      details: ["Photos and a short bio", "Relationship intentions", "Values and lifestyle questions", "Who you’d like to meet"],
    },
    {
      key: "discover",
      title: "Discover people with shared ground",
      body: "Explore recommendations shaped by your preferences, with shared interests explained clearly.",
      details: ["Recommendations from your preferences", "Reasons shown in words", "Your choice on every profile"],
    },
    {
      key: "connect",
      title: "Connect when interest is mutual",
      body: "Connect when you both express interest, then start a conversation.",
      details: ["Express interest", "Connect when it’s mutual", "Start a conversation"],
    },
  ],
  status: {
    title: "Where things stand",
    body: "Mingle brings profile creation, thoughtful discovery and mutual connection together in one considered experience.",
  },
  /** Link to the standalone page describing the Mingle member journey. */
  more: { label: "See the full journey, feature by feature", href: "/how-it-works" },
} as const;

/* ------------------------------------------------------------------ compatibility */

export const compatibility = {
  id: "approach",
  title: "Chemistry matters. So does understanding.",
  lead: "Discover shared ground without scores or promises.",
  how: [
    {
      title: "You choose what to share",
      body: "You answer questions about what you’re looking for and how you live. You decide how much to say.",
    },
    {
      title: "Mingle looks for overlap",
      body: "Recommendations lean toward people whose answers and preferences have something in common with yours.",
    },
    {
      title: "You see why",
      body: "A recommendation is meant to show its reasons in plain words, so you can judge it yourself.",
    },
  ],
  signalsTitle: "What recommendations draw on",
  signals: [
    { label: "Relationship intentions", body: "The kind of relationship you’re open to." },
    { label: "Core values", body: "What you care about in people and in life." },
    { label: "Lifestyle", body: "How you like to spend your time and energy." },
    { label: "Interests", body: "The things you enjoy doing." },
    { label: "Communication preferences", body: "How you like to stay in touch." },
  ],
  figure: {
    caption: "A visual expression of shared interests, values and connection.",
    overlapLabel: "Shared ground",
  },
  disclaimerTitle: "Guidance, not a guarantee",
  disclaimer:
    "Compatibility is guidance to help you decide where to start. It can’t predict whether two people will get along, and Mingle can’t guarantee a match or a relationship. You won’t see a compatibility percentage or score.",
  excluded:
    "Mingle doesn’t use religion, ethnicity, politics or health to work out compatibility.",
} as const;

/* ------------------------------------------------------------------ values and experience */

export type ExperienceKey = "profiles" | "reasons" | "mutual" | "control";

export const values = {
  id: "values",
  title: "A better way to connect",
  lead: "Built around intention, clarity, respect and choice.",
  principles: [
    {
      title: "Intention over volume",
      body: "A few relevant people are worth more than an endless feed. Discovery is designed to be deliberate.",
    },
    {
      title: "Clarity over guesswork",
      body: "Saying what you’re looking for early helps people avoid mismatched expectations.",
    },
    {
      title: "Respect by design",
      body: "Connection happens by mutual interest, not by unsolicited contact.",
    },
    {
      title: "Your information, your choice",
      body: "You decide what to share. We ask only for what the experience needs.",
    },
  ],
  experienceTitle: "The experience we’re aiming for",
  experience: [
    {
      key: "profiles",
      title: "Profiles with room to be yourself",
      body: "Photos, a bio and your answers sit together, so a profile says more than a first glance.",
    },
    {
      key: "reasons",
      title: "Recommendations that explain themselves",
      body: "You see the shared ground behind a suggestion, in words, without a number attached.",
    },
    {
      key: "mutual",
      title: "Conversations by mutual interest",
      body: "You connect when both people are interested, then start from what you have in common.",
    },
    {
      key: "control",
      title: "Controls that stay with you",
      body: "You’re meant to be able to manage your preferences and who can see your profile.",
    },
  ],
  note: "This describes the experience Mingle is being designed to offer. These features are in development and aren’t available to use yet.",
} as const;

/* ------------------------------------------------------------------ trust and safety */

export type TrustKey = "discovery" | "privacy" | "respect";

export const trust = {
  id: "trust-and-safety",
  title: "Your comfort comes first.",
  lead: "Your privacy, comfort and safety matter.",
  adult: {
    mark: "18+",
    title: "Adults only",
    body: "Mingle is for adults aged 18 and over. You’ll give your date of birth when you sign up, and member features are designed to stay closed to anyone whose declared date of birth is under 18. Mingle doesn’t verify age with ID, so a date of birth is a declaration rather than proof, and accounts found to belong to anyone under 18 are removed.",
  },
  pillars: [
    {
      key: "discovery",
      title: "Responsible discovery",
      points: [
        "Recommendations come from preferences you choose to share.",
        "Sensitive traits aren’t used to work out compatibility.",
        "Messaging is intended for people who have connected by mutual interest.",
      ],
    },
    {
      key: "privacy",
      title: "Privacy",
      points: [
        "We aim to collect only what the experience needs.",
        "We don’t plan to ask for identity documents or face scans to check age.",
        "Controls over your profile’s visibility are planned.",
      ],
    },
    {
      key: "respect",
      title: "Respectful interaction",
      points: [
        "Community standards are being written for every member.",
        "Blocking and reporting are being designed.",
        "Moderation and support processes are being planned.",
      ],
    },
  ],
  status: {
    title: "Not live yet",
    lead: "We’ll describe a safety feature as available only once it works.",
    items: [
      { label: "Account sign-up", state: "Not open yet" },
      { label: "Blocking and reporting", state: "In development" },
      { label: "Moderation and support", state: "Being planned" },
      { label: "Profile verification", state: "Being planned" },
    ],
  },
  legalNote:
    "Our safety centre, community guidelines and privacy information are drafts that haven’t been published or legally reviewed.",
  links: [
    { label: "Safety centre (in progress)", href: "/safety" },
    { label: "Community guidelines (in progress)", href: "/community-guidelines" },
  ],
} as const;

/* ------------------------------------------------------------------ final call to action */

export const finalCta = {
  id: "final-cta",
  title: "Ready to mingle?",
  body: "Start with what matters to you and meet people who share it.",
  adultLine: "Mingle is for adults aged 18 and over.",
  primary: authLinks.getStarted,
  signIn: authLinks.signIn,
  safety: { label: "Read about safety", href: "/safety" },
} as const;
