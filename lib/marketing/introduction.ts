/**
 * Copy for the landing introduction (F2.4). Kept as plain data so tests can enforce the
 * messaging rules (brief §6, §15): no guarantees, no statistics or testimonials, no claim
 * that compatibility is scientific or predictive, and no sensitive traits in scoring.
 */
export type PillarKey = "values" | "lifestyle" | "discovery" | "connection";

export const introduction = {
  id: "introduction",
  eyebrow: "What Mingle is",
  title: "Not just another profile. A better way to connect.",
  lead: "A compatibility-first way for adults aged 18 and over to meet through shared interests, values, lifestyle and intentions.",
  blocks: [
    {
      title: "The problem we’re addressing",
      body: "A quick first impression can miss what matters. Mingle looks beyond photos to what people value and want.",
    },
    {
      title: "Why compatibility matters",
      body: "Attraction may start a conversation; shared values, lifestyles and intentions can give it room to grow.",
    },
  ],
  comparison: {
    title: "Swipe-first discovery and Mingle",
    swipeLabel: "Swipe-first",
    mingleLabel: "Mingle",
    rows: [
      {
        aspect: "First impression",
        swipe: "A photo and a short bio.",
        mingle: "Photos alongside values, lifestyle and what you’re looking for.",
      },
      {
        aspect: "Finding people",
        swipe: "Scrolling through an endless stream.",
        mingle: "Recommendations shaped by the preferences you choose to share.",
      },
      {
        aspect: "Starting a conversation",
        swipe: "A match, then a blank chat.",
        mingle: "Shared ground to start from.",
      },
      {
        aspect: "Pace",
        swipe: "Fast, high-volume choices.",
        mingle: "More deliberate, by design.",
      },
    ],
    note: "A general contrast, not a comparison with any particular app.",
  },
  pillars: [
    {
      key: "values",
      title: "Shared interests and values",
      body: "Start from what you genuinely have in common.",
    },
    {
      key: "lifestyle",
      title: "Lifestyle compatibility",
      body: "Everyday rhythms and preferences count too.",
    },
    {
      key: "discovery",
      title: "Intentional discovery",
      body: "Spend your attention on people who are relevant to you.",
    },
    {
      key: "connection",
      title: "Meaningful connection",
      body: "Conversations that begin with something real to talk about.",
    },
  ],
  note: "Compatibility is a guide, not a guarantee. Mingle uses the preferences you choose to share—not sensitive traits—and can’t promise a match or relationship.",
} as const;
