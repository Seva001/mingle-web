import type { CompatibilitySignal } from "@/lib/compatibility/weights";

/**
 * Choices members pick from. Deliberately excludes sensitive traits (religion, politics,
 * ethnicity, health): brief §6 says never infer or lean on them. Interests are plain activities.
 */
export const INTENTIONS = [
  { value: "long_term", label: "A long-term relationship" },
  { value: "marriage", label: "Marriage" },
  { value: "dating_open", label: "Dating to see where it goes" },
  { value: "friendship_first", label: "Friendship first, then see" },
] as const;
export type Intention = (typeof INTENTIONS)[number]["value"];

// Product/legal decision to revisit: a wider, self-describe model (docs/DECISIONS.md).
export const GENDERS = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "non_binary", label: "Non-binary" },
] as const;
export type Gender = (typeof GENDERS)[number]["value"];

export const INTERESTS = [
  "Travel",
  "Cooking",
  "Fitness",
  "Reading",
  "Music",
  "Film",
  "Hiking",
  "Photography",
  "Gaming",
  "Art",
  "Dancing",
  "Football",
  "Volunteering",
  "Entrepreneurship",
  "Fashion",
  "Technology",
  "Gardening",
  "Board games",
  "Coffee",
  "Writing",
  "Pets",
  "Road trips",
  "Podcasts",
  "Yoga",
] as const;
export type Interest = (typeof INTERESTS)[number];

export const MIN_INTERESTS = 3;
export const MAX_INTERESTS = 8;
export const MAX_PHOTOS = 6;
export const BIO_MIN = 20;
export const BIO_MAX = 500;
export const MIN_ADULT_AGE = 18;
export const MAX_DISCOVERY_AGE = 99;
export const MAX_VERIFIED_AGE = 120;

/** null = anywhere in my country. */
export const DISTANCE_CHOICES = [25, 50, 100, 250, null] as const;
export type DistanceChoice = (typeof DISTANCE_CHOICES)[number];

export type QuestionOption = { id: string; label: string };
export type QuestionSignal = Extract<
  CompatibilitySignal,
  "coreValues" | "lifestyle" | "communicationPreferences"
>;
export type Question = {
  id: string;
  signal: QuestionSignal;
  prompt: string;
  /** Shown beside the question: why it is asked and how it is used (brief §6). */
  why: string;
  options: readonly QuestionOption[];
};

export const QUESTIONS: readonly Question[] = [
  {
    id: "v_family",
    signal: "coreValues",
    prompt: "How important is family in your life?",
    why: "Helps suggest people whose priorities around family are similar to yours.",
    options: [
      { id: "central", label: "Central to my life" },
      { id: "very", label: "Very important" },
      { id: "alongside", label: "Important, alongside other things" },
      { id: "not_now", label: "Not a priority right now" },
    ],
  },
  {
    id: "v_ambition",
    signal: "coreValues",
    prompt: "How would you describe your ambitions?",
    why: "Used to compare how much each person puts into work and goals.",
    options: [
      { id: "driven", label: "Career-driven" },
      { id: "balanced", label: "Balanced between work and life" },
      { id: "life_first", label: "Focused on life outside work" },
      { id: "figuring", label: "Still figuring it out" },
    ],
  },
  {
    id: "v_priority",
    signal: "coreValues",
    prompt: "What matters most to you in a partner?",
    why: "Shows which qualities you weigh most, so shared priorities can be explained.",
    options: [
      { id: "honesty", label: "Honesty and trust" },
      { id: "kindness", label: "Kindness" },
      { id: "goals", label: "Shared goals" },
      { id: "humour", label: "A good sense of humour" },
    ],
  },
  {
    id: "l_weekend",
    signal: "lifestyle",
    prompt: "What does a good weekend look like?",
    why: "Compares day-to-day pace and how social you like your free time.",
    options: [
      { id: "out", label: "Out with friends and activities" },
      { id: "mix", label: "A mix of social and quiet" },
      { id: "home", label: "Quiet time at home" },
      { id: "explore", label: "Exploring somewhere new" },
    ],
  },
  {
    id: "l_rhythm",
    signal: "lifestyle",
    prompt: "Early bird or night owl?",
    why: "Daily rhythm affects how easily two schedules fit together.",
    options: [
      { id: "early", label: "Early bird" },
      { id: "night", label: "Night owl" },
      { id: "depends", label: "It depends on the day" },
    ],
  },
  {
    id: "l_children",
    signal: "lifestyle",
    prompt: "Do you want children?",
    why: "A big life expectation. We only compare answers you choose to give.",
    options: [
      { id: "yes", label: "Yes" },
      { id: "open", label: "Open to it" },
      { id: "no", label: "No" },
      { id: "unsure", label: "Not sure yet" },
    ],
  },
  {
    id: "c_contact",
    signal: "communicationPreferences",
    prompt: "How do you like to stay in touch?",
    why: "Helps suggest people whose communication rhythm matches yours.",
    options: [
      { id: "often", label: "Frequent messages" },
      { id: "few", label: "A few good conversations" },
      { id: "calls", label: "Calls over texts" },
      { id: "in_person", label: "Meeting in person" },
    ],
  },
  {
    id: "c_disagree",
    signal: "communicationPreferences",
    prompt: "When you disagree, you tend to…",
    why: "Compares how each person handles tension, to explain a shared approach.",
    options: [
      { id: "now", label: "Talk it through right away" },
      { id: "time", label: "Take time, then talk" },
      { id: "write", label: "Write it out" },
      { id: "light", label: "Keep things calm and light" },
    ],
  },
];

export function findQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}
