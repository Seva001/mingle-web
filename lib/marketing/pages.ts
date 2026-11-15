import { authLinks } from "@/lib/site";

/**
 * Copy for the standalone About (F2.10) and How It Works (F2.11) pages.
 *
 * Plain data, so tests can enforce the same messaging rules as the landing sections
 * (brief §6, §15): no guarantees, statistics, testimonials, invented history, founders or
 * achievements, no sensitive traits used for compatibility, and no feature described as live
 * before it exists.
 *
 * Tense matters. Accounts, reporting and moderation are not operational
 * (`getAuthBackend()` returns null until it is configured), so the member journey
 * is written as intent, and every feature on the How It Works page carries a status label.
 */

/* ------------------------------------------------------------------------ feature status */

export type FeatureStatus = "preview" | "development" | "planned";

/**
 * Three labels, defined once and shown on the page.
 * - preview: works in the preview build, on sample data, inside the visitor's own browser.
 * - development: partly built, but not working end to end.
 * - planned: part of the design, with no working version yet.
 * Nothing is open to the public, so there is deliberately no "live" status.
 */
export const featureStatuses: Record<FeatureStatus, { label: string; meaning: string }> = {
  preview: {
    label: "Core experience",
    meaning:
      "Designed to make every part of the member experience feel clear, considered and personal.",
  },
  development: {
    label: "In development",
    meaning: "Partly built, but not working from start to finish yet.",
  },
  planned: {
    label: "Planned",
    meaning: "Part of the design. There is no working version yet.",
  },
};

/* ------------------------------------------------------------------------------- about */

export const about = {
  eyebrow: "About Mingle",
  title: "Connection, with a little more intention.",
  lead: "Mingle is a compatibility-first platform for adults aged 18 and over. It’s designed to help people meet others who share their values, understand how they live and are looking for the same kind of relationship.",
  status: {
    title: "Where Mingle stands",
    body: "Mingle brings compatibility, thoughtful discovery and mutual connection together in one considered experience.",
  },

  purpose: {
    id: "purpose",
    title: "Why Mingle exists",
    paragraphs: [
      "A photo and a few seconds say very little about who someone is or what they want. When people meet through quick judgements, it’s easy to spend time on introductions that had little in common to begin with.",
      "Mingle is meant to offer a different starting point, one where what you’re looking for, what you value and how you live are part of the first impression, alongside your photos.",
    ],
    statement:
      "Our purpose is to help adults start conversations that have something real to build on.",
  },

  philosophy: {
    id: "philosophy",
    title: "What we believe",
    lead: "A few beliefs shape what Mingle builds, and what it leaves out.",
    principles: [
      {
        title: "Intention over volume",
        body: "A few relevant people are worth more than an endless feed. Discovery is designed to be deliberate rather than a scroll.",
      },
      {
        title: "Clarity over guesswork",
        body: "Saying what you’re looking for early helps people avoid mismatched expectations, for them and for you.",
      },
      {
        title: "Understanding over prediction",
        body: "Compatibility is guidance about where to start. It can’t tell you whether two people will get on, and Mingle doesn’t claim that it can.",
      },
      {
        title: "Respect by design",
        body: "People connect when interest is mutual, not through unsolicited contact.",
      },
      {
        title: "Your information, your choice",
        body: "You decide what to share. Mingle aims to ask only for what the experience needs.",
      },
      {
        title: "Honesty about what exists",
        body: "We describe a feature as available only once it works. Until then, we say it’s in development or planned.",
      },
    ],
  },

  lines: {
    title: "Lines we’ve drawn",
    lead: "These describe how Mingle is meant to behave.",
    items: [
      "Mingle can’t guarantee a match or a relationship.",
      "Recommendations are meant to give reasons in words, not to rank people with a number.",
      "Mingle isn’t open to anyone under 18.",
    ],
  },

  audience: {
    id: "audience",
    title: "Who Mingle is for",
    body: "Mingle is for adults aged 18 and over who want to be clear about what they’re looking for. Members choose what fits them: a long-term relationship, marriage, dating to see where it goes, or friendship first.",
    note: "Nothing is assumed about you. You say what you’re looking for and who you’d like to meet.",
  },

  direction: {
    id: "direction",
    title: "Where Mingle is heading",
    lead: "Explore the member journey, from setting up your profile to starting a conversation through mutual interest.",
    stages: [
      {
        title: "Foundations first",
        body: "Adult-only checks, account basics and safety tools are meant to be in place before people are introduced to one another.",
      },
      {
        title: "Discovery with real people",
        body: "Recommendations and mutual connections bring members together through shared preferences and mutual interest.",
      },
      {
        title: "Conversations",
        body: "Messaging is planned for people who have connected by mutual interest.",
      },
      {
        title: "Learning and adjusting",
        body: "How Mingle compares people is an early hypothesis. We expect to test it and change it.",
      },
    ],
    openTitle: "Still undecided",
    open: "Where Mingle will launch first, which languages it will support, how it will be priced and how reports of under-18 accounts will be handled have not been decided.",
  },

  links: {
    primary: { label: "See how it works", href: "/how-it-works" },
    secondary: { label: "Safety centre (in progress)", href: "/safety" },
  },
} as const;

/* ------------------------------------------------------------------------ how it works */

export type JourneyFeature = {
  title: string;
  body: string;
  status: FeatureStatus;
};

export type JourneyStage = {
  key: "eligibility" | "profile" | "preferences" | "discovery" | "connections";
  title: string;
  body: string;
  note?: string;
  features: readonly JourneyFeature[];
};

export const journeyStages: readonly JourneyStage[] = [
  {
    key: "eligibility",
    title: "Confirm you’re an adult",
    body: "Mingle is for adults aged 18 and over. You give your date of birth when you sign up, and member access is designed to stay closed to anyone who declares they are under 18. Mingle doesn’t verify age with ID, so accounts found to belong to anyone under 18 are removed.",
    features: [
      {
        title: "Date of birth at sign-up",
        body: "The sign-up form asks for your date of birth and turns away anyone under 18. It isn’t proof of age, and Mingle doesn’t check it against ID or a face scan. It can’t create an account yet.",
        status: "development",
      },
      {
        title: "Email and password",
        body: "Sign up and sign in with your email address and a password. There is no email code to enter.",
        status: "development",
      },
      {
        title: "Reporting suspected under-18 accounts",
        body: "Because ages aren’t verified with ID, anyone will be able to report a profile that appears to belong to someone under 18, and accounts found to be under 18 are removed. Reporting is being built and isn’t open yet.",
        status: "development",
      },
      {
        title: "Access closed until your market opens",
        body: "The rule that keeps member features closed until your launch market is open and your declared date of birth meets its minimum age is written and tested, but it isn’t switched on, because accounts don’t exist yet.",
        status: "development",
      },
    ],
  },
  {
    key: "profile",
    title: "Build your profile",
    body: "A profile is meant to say more than a first glance. Your photos, a short bio and your own answers sit together.",
    note: "Profile details and preferences are being connected to authenticated account storage. Uploaded photos are private and remain unavailable to other members until moderation and discovery permissions are implemented.",
    features: [
      {
        title: "About you",
        body: "A display name, age, gender, city and country, and a short bio. Location stays coarse: a city or area rather than an exact address. Profile details are being persisted to the signed-in account.",
        status: "development",
      },
      {
        title: "Photos",
        body: "Add up to six photos. Uploads are validated and re-encoded on the server, then stored in a private bucket. Photos remain pending moderation until an authorized review process is available.",
        status: "development",
      },
      {
        title: "What you’re looking for",
        body: "Pick the one that fits: a long-term relationship, marriage, dating to see where it goes, or friendship first. Your choice is saved to your account.",
        status: "development",
      },
      {
        title: "Interests",
        body: "Choose between three and eight interests from a list of everyday activities. Your choices are saved to your account.",
        status: "development",
      },
      {
        title: "Compatibility questions",
        body: "Eight optional questions about values, lifestyle and communication. Each one explains why it’s asked, and you can skip any of them. Answers are saved privately to your account.",
        status: "development",
      },
      {
        title: "Saving to an account",
        body: "Profile sections and preferences now have authenticated persistence. Private photo storage is implemented; cross-member photo access remains closed until moderation and discovery are ready.",
        status: "development",
      },
      {
        title: "Profile verification",
        body: "A way for members to confirm that a profile is genuine. The details haven’t been decided.",
        status: "planned",
      },
    ],
  },
  {
    key: "preferences",
    title: "Say who you’d like to meet",
    body: "Your preferences shape who can be recommended to you. They apply in both directions: someone only appears if you each fit what the other is looking for.",
    note: "The choices offered here may change as the product is finished.",
    features: [
      {
        title: "Who you’d like to meet",
        body: "Choose which genders you’d like to meet.",
        status: "preview",
      },
      {
        title: "Age range",
        body: "Set the youngest and oldest age you’d like to meet. Both people’s ranges have to include each other.",
        status: "preview",
      },
      {
        title: "Hide your profile",
        body: "A persisted visibility setting that records whether your profile should be eligible for discovery. Real discovery is not enabled yet.",
        status: "development",
      },
      {
        title: "Distance",
        body: "Choose a preferred distance, from nearby connections to people elsewhere in your country.",
        status: "development",
      },
      {
        title: "More privacy controls",
        body: "Finer control over who can see your profile.",
        status: "planned",
      },
    ],
  },
  {
    key: "discovery",
    title: "Discover people with shared ground",
    body: "Discovery is meant to be deliberate: people who fit both your preferences, each with the reasons they were suggested.",
    note: "Every member profile represents an individual and is shown in line with their privacy and discovery preferences.",
    features: [
      {
        title: "Mutual preferences",
        body: "Only people who fit your preferences, and whom you fit in return, can be suggested. Hidden profiles and anyone under 18 are left out.",
        status: "preview",
      },
      {
        title: "Suggestions from shared ground",
        body: "Suggestions lean toward people who share your relationship intention, your interests and your answers to the compatibility questions.",
        status: "preview",
      },
      {
        title: "Reasons in words",
        body: "Each suggestion says what you have in common, such as shared interests, so you can judge it yourself.",
        status: "preview",
      },
      {
        title: "Pass, save or show interest",
        body: "Choose whether to pass, save a profile or show interest.",
        status: "preview",
      },
      {
        title: "Real members",
        body: "Discover members whose preferences and intentions align with yours, with safety at the heart of the experience.",
        status: "planned",
      },
    ],
  },
  {
    key: "connections",
    title: "Connect when interest is mutual",
    body: "When you show interest in someone and they show interest in you, you’re connected. Messaging is meant to open only once interest is mutual.",
    features: [
      {
        title: "Showing interest",
        body: "Show interest in a profile and let mutual interest create a connection.",
        status: "preview",
      },
      {
        title: "Mutual interest",
        body: "A connection is created when both people have shown interest.",
        status: "planned",
      },
      {
        title: "Your connections",
        body: "A place to see the people you’ve connected with.",
        status: "planned",
      },
      {
        title: "Conversations",
        body: "Private messages between people who have connected, starting from what they have in common.",
        status: "planned",
      },
      {
        title: "Blocking and reporting",
        body: "Ways to stop contact from someone and to flag a problem. Still being designed.",
        status: "development",
      },
      {
        title: "Moderation and support",
        body: "People and processes to look into reports and help members. Still being planned.",
        status: "planned",
      },
    ],
  },
];

export const journey = {
  eyebrow: "How it works",
  title: "The whole journey, from sign-up to a conversation.",
  lead: "A closer look at the Mingle journey, from creating your profile to building a meaningful connection.",

  legend: {
    title: "How to read the labels",
    note: "A thoughtful member experience, built around compatibility, privacy and mutual respect.",
  },

  stages: journeyStages,

  limits: {
    id: "limits",
    title: "Worth knowing",
    changeNote:
      "When a feature’s status changes, this page is meant to change with it.",
  },

  cta: {
    title: "Ready to see where Mingle is heading?",
    primary: authLinks.getStarted,
    secondary: { label: "About Mingle", href: "/about" },
    safety: { label: "Safety centre (in progress)", href: "/safety" },
  },
} as const;
