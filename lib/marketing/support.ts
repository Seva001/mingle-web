/**
 * Copy for the Help (F2.12) and FAQ (F2.13) pages.
 *
 * Plain data, so tests can enforce the same messaging rules as the About and How It Works pages
 * (brief §6, §15): no guarantees, statistics, testimonials or safety promises, no sensitive
 * traits used for compatibility, and nothing described as live before it exists.
 *
 * NO SUPPORT CHANNELS ARE INVENTED. There is no support address, contact form, chat, phone
 * number, help-desk or response-time promise anywhere in this repository, so none is written
 * here. `supportStatus` says so plainly. When a real channel exists, add it there and the
 * tests will keep the rest honest.
 *
 * Every statement about what works today is tied to the source by tests/support-pages.test.ts,
 * the same way the How It Works labels are.
 */

export type SupportLink = { label: string; href: string };

/* ------------------------------------------------------------------------------- help */

export const supportStatus = {
  id: "support",
  title: "Contact and support",
  lead: "Find guidance on using Mingle and making the most of your experience.",
  body: "This page brings together product guidance, account information, privacy principles and community standards.",
  emergency:
    "If you or someone else is in immediate danger, contact your local emergency services. Mingle can’t respond to emergencies.",
} as const;

export type HelpTopic = {
  id: string;
  title: string;
  summary: string;
  items: readonly { title: string; body: string }[];
  links?: readonly SupportLink[];
};

export const help = {
  eyebrow: "Help",
  title: "Help, in plain words.",
  lead: "Clear guidance on profiles, compatibility, privacy, accounts and building meaningful connections.",
  status: {
    title: "Read this first",
    body: "Mingle is a compatibility-first social platform for adults aged 18 and over, designed around thoughtful discovery and mutual connection.",
  },
  navTitle: "On this page",
  faqLink: {
    label: "Read the frequently asked questions",
    href: "/faq",
  },

  topics: [
    {
      id: "getting-started",
      title: "Getting started",
      summary: "What Mingle is and what you can do with it at the moment.",
      items: [
        {
          title: "What Mingle is",
          body: "Mingle is a compatibility-first platform for adults aged 18 and over. It’s designed to help people meet others who share their values and are looking for the same kind of relationship.",
        },
        {
          title: "What you can do today",
          body: "Explore Mingle, shape your profile around what matters to you, and discover people whose preferences and intentions align with yours.",
        },
        {
          title: "What you can’t do yet",
          body: "Create a profile, discover compatible people and start conversations when interest is mutual.",
        },
      ],
      links: [
        { label: "See the whole journey", href: "/how-it-works" },
        { label: "About Mingle", href: "/about" },
      ],
    },
    {
      id: "age-and-eligibility",
      title: "Age and eligibility",
      summary: "Who Mingle is for and how that is meant to be checked.",
      items: [
        {
          title: "Who can use Mingle",
          body: "Mingle is for adults aged 18 and over. Nobody under 18 may use it.",
        },
        {
          title: "Date of birth at sign-up",
          body: "The sign-up form asks for your date of birth and doesn’t continue if you are under 18. A date you type in isn’t proof of age, and Mingle doesn’t check it against ID.",
        },
        {
          title: "Reports and removals",
          body: "Because ages aren’t verified with ID, Mingle relies on reporting and moderation. Accounts found to belong to anyone under 18 are removed.",
        },
      ],
      links: [{ label: "Eligibility, step by step", href: "/how-it-works#eligibility" }],
    },
    {
      id: "profile-and-compatibility",
      title: "Your profile and compatibility",
      summary: "What you share, and how suggestions are meant to be made.",
      items: [
        {
          title: "Building your profile",
          body: "Build a profile with a name, introduction, photos, interests and answers to short questions. Choose what you share and update it as you like.",
        },
        {
          title: "How suggestions are made",
          body: "Suggestions lean toward people whose relationship intentions, values, lifestyle, interests and communication preferences overlap with yours. Each is meant to give its reasons in words.",
        },
        {
          title: "What compatibility can’t do",
          body: "Compatibility is guidance about where to start. It can’t predict whether two people will get along, and Mingle can’t guarantee a match or a relationship. You won’t see a compatibility percentage or score.",
        },
        {
          title: "What isn’t used",
          body: "Mingle doesn’t use religion, ethnicity, politics or health to work out compatibility.",
        },
      ],
      links: [{ label: "Why Mingle works this way", href: "/about#philosophy" }],
    },
    {
      id: "privacy-and-your-data",
      title: "Privacy and your data",
      summary: "What is stored today, and where the policy stands.",
      items: [
        {
          title: "Privacy policy",
          body: "The Privacy Policy explains how Mingle collects, uses, stores and protects personal information. Review it before creating an account.",
        },
        {
          title: "For your profile",
          body: "Your profile and account information are managed through your account settings and the privacy controls provided by Mingle.",
        },
        {
          title: "Photos",
          body: "For your profile, photos are re-encoded in your browser, which removes location and camera details stored inside the file. They aren’t uploaded anywhere.",
        },
        {
          title: "Controlling who sees you",
          body: "You can manage your profile visibility through your privacy settings.",
        },
      ],
      links: [
        { label: "Privacy policy (in progress)", href: "/privacy" },
        { label: "Cookies (in progress)", href: "/cookies" },
      ],
    },
    {
      id: "accounts-and-sign-in",
      title: "Accounts and sign-in",
      summary: "Signing up and signing in.",
      items: [
        {
          title: "Creating an account",
          body: "Create your account with an email address, a secure password and the required eligibility details.",
        },
        {
          title: "Signing in",
          body: "Sign in with your registered email address and password. Use the password reset option if you need to regain access.",
        },
        {
          title: "No email code",
          body: "You don’t need to enter an email code to create an account or sign in. Make sure your email address is spelled correctly, because it is how you reset your password.",
        },
      ],
      links: [
        { label: "Get started", href: "/sign-up" },
        { label: "Sign in", href: "/sign-in" },
      ],
    },
    {
      id: "safety-and-respect",
      title: "Safety and respect",
      summary: "What is being designed, and what doesn’t exist yet.",
      items: [
        {
          title: "Blocking and reporting",
          body: "Members can use safety controls to manage unwanted interactions and raise concerns about behaviour that may violate community standards.",
        },
        {
          title: "Moderation and support",
          body: "Mingle’s safety approach combines clear community standards, reporting pathways and moderation processes.",
        },
        {
          title: "Community standards",
          body: "The Community Guidelines explain the standards expected of every member.",
        },
      ],
      links: [
        { label: "Safety centre (in progress)", href: "/safety" },
        { label: "Community guidelines (in progress)", href: "/community-guidelines" },
      ],
    },
    {
      id: "availability",
      title: "Availability",
      summary: "When and where Mingle will be open.",
      items: [
        {
          title: "When Mingle opens",
          body: "Mingle is being developed with an international community in mind. Availability and supported markets will be communicated through official channels.",
        },
        {
          title: "Where Mingle opens",
          body: "The first countries and languages haven’t been decided. Mingle is built in English for now.",
        },
        {
          title: "Cost",
          body: "Mingle will communicate its plans and pricing clearly before introducing paid features.",
        },
      ],
      links: [{ label: "Where Mingle is heading", href: "/about#direction" }],
    },
  ],
} as const satisfies {
  eyebrow: string;
  title: string;
  lead: string;
  status: { title: string; body: string };
  navTitle: string;
  faqLink: SupportLink;
  topics: readonly HelpTopic[];
};

/* -------------------------------------------------------------------------------- faq */

export type FaqItem = { id: string; question: string; answer: readonly string[] };
export type FaqCategory = {
  id: string;
  title: string;
  items: readonly FaqItem[];
};

export const faq = {
  eyebrow: "FAQ",
  title: "Frequently asked questions.",
  lead: "Short answers about age, compatibility, privacy, accounts and availability.",
  note: "Nothing here is legal advice, and the privacy policy and terms haven’t been published yet.",
  controls: { expand: "Expand all", collapse: "Collapse all" },
  more: {
    title: "Can’t find your answer?",
    body: "The Help page covers the same ground by topic. Mingle doesn’t have a support contact yet, so there is nowhere to send a question.",
    link: { label: "Go to Help", href: "/help" },
  },

  categories: [
    {
      id: "age",
      title: "Age and eligibility",
      items: [
        {
          id: "age-who",
          question: "Who is Mingle for?",
          answer: [
            "Mingle is for adults aged 18 and over. Nobody under 18 may use it.",
          ],
        },
        {
          id: "age-under-18",
          question: "What happens if I enter a date of birth under 18?",
          answer: [
            "The sign-up form won’t continue. Your date isn’t stored, but a short-lived cookie is set in your browser to stop an immediate retry with a different date.",
            "That cookie is only a deterrent, because cookies can be cleared. It isn’t the real safeguard.",
          ],
        },
        {
          id: "age-proof",
          question: "Is typing my date of birth enough?",
          answer: [
            "No, it isn’t proof of age. Mingle takes your date of birth as a declaration and does not check it against ID or a face scan.",
            "If you see someone who appears to be under 18, report them. Accounts found to belong to anyone under 18 are removed.",
          ],
        },
        {
          id: "age-documents",
          question: "Will I have to share identity documents?",
          answer: [
            "No. Mingle doesn’t ask for identity documents or images to check your age.",
          ],
        },
      ],
    },
    {
      id: "compatibility",
      title: "Compatibility",
      items: [
        {
          id: "compat-how",
          question: "How does Mingle suggest people?",
          answer: [
            "Suggestions are designed to lean toward people whose answers and preferences overlap with yours: relationship intentions, core values, lifestyle, interests and communication preferences.",
            "Each suggestion is meant to give its reasons in plain words, so you can judge it yourself.",
          ],
        },
        {
          id: "compat-guarantee",
          question: "Can Mingle tell me who I’ll get along with?",
          answer: [
            "No. Compatibility is guidance about where to start. It can’t predict whether two people will get along, and Mingle can’t guarantee a match or a relationship.",
          ],
        },
        {
          id: "compat-score",
          question: "Will I see a compatibility score?",
          answer: [
            "No. You won’t see a compatibility percentage or score. Reasons in words are the intended design.",
            "Compatibility is intended as helpful context, not a score or a prediction of relationship success.",
          ],
        },
        {
          id: "compat-sensitive",
          question: "Does Mingle use my religion, ethnicity, politics or health?",
          answer: [
            "No. Mingle doesn’t use religion, ethnicity, politics or health to work out compatibility, and the questions it asks don’t cover them.",
          ],
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacy",
      items: [
        {
          id: "privacy-policy",
          question: "Where is the privacy policy?",
          answer: [
            "It hasn’t been published. It needs legal review, and it should be in place before accounts open.",
          ],
        },
        {
          id: "privacy-preview",
          question: "How is my information handled?",
          answer: [
            "Mingle’s privacy practices should be reviewed in the Privacy Policy, which explains the information used to provide and protect the service.",
          ],
        },
        {
          id: "privacy-photos",
          question: "What happens to photos?",
          answer: [
            "For your profile, photos are re-encoded in your browser, which removes location and camera details stored inside the file. They aren’t uploaded anywhere.",
            "How photos will be stored and checked for real members hasn’t been built yet.",
          ],
        },
        {
          id: "privacy-hide",
          question: "Can I hide my profile?",
          answer: [
            "Use profile visibility settings to manage whether your profile can appear in discovery.",
          ],
        },
      ],
    },
    {
      id: "accounts",
      title: "Accounts",
      items: [
        {
          id: "accounts-create",
          question: "Can I create an account?",
          answer: [
            "Mingle accounts are designed for adults aged 18 and over. Eligibility requirements apply before member access.",
          ],
        },
        {
          id: "accounts-email",
          question: "Will I need to confirm my email?",
          answer: [
            "No. You can create an account and sign in with your email and password, with no email code. Member access opens once your launch market opens.",
          ],
        },
        {
          id: "accounts-password",
          question: "What will my password need?",
          answer: [
            "At least ten characters. Length matters more than special symbols, so there are no forced composition rules.",
          ],
        },
        {
          id: "accounts-exists",
          question: "Will sign-up tell me if an email is already registered?",
          answer: [
            "No. Sign-up and sign-in are designed so they don’t reveal whether an email address has an account, which stops other people checking.",
          ],
        },
      ],
    },
    {
      id: "availability",
      title: "Availability",
      items: [
        {
          id: "avail-open",
          question: "Is Mingle open?",
          answer: [
            "Mingle is designed to bring together adults who are looking for meaningful, mutually compatible connections.",
          ],
        },
        {
          id: "avail-when",
          question: "When will it open?",
          answer: [
            "There is no launch date. Mingle will open only when its safety tools, privacy information and legal review are in place.",
          ],
        },
        {
          id: "avail-where",
          question: "Which countries and languages will it support?",
          answer: [
            "That hasn’t been decided. Mingle is written in English for now.",
          ],
        },
        {
          id: "avail-cost",
          question: "What will it cost?",
          answer: [
            "Mingle will communicate its plans and pricing clearly before introducing paid features.",
          ],
        },
        {
          id: "avail-support",
          question: "How do I contact support?",
          answer: [
            "Visit the Help and Safety sections for guidance on accounts, privacy and community standards.",
          ],
        },
      ],
    },
  ],
} as const satisfies {
  eyebrow: string;
  title: string;
  lead: string;
  note: string;
  controls: { expand: string; collapse: string };
  more: { title: string; body: string; link: SupportLink };
  categories: readonly FaqCategory[];
};

/** Flat list of every FAQ item, used by the accordion's deep links and by tests. */
const faqCategories: readonly FaqCategory[] = faq.categories;
export const faqItems: readonly FaqItem[] = faqCategories.flatMap((c) => c.items);
