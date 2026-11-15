import { Section } from "@/components/marketing/section";

const steps = [
  {
    number: "01",
    title: "Create your profile",
    body: "Share a little about yourself and what matters to you.",
  },
  {
    number: "02",
    title: "Discover people",
    body: "Explore people with shared interests and intentions.",
  },
  {
    number: "03",
    title: "Connect",
    body: "Start a conversation when interest is mutual.",
  },
] as const;

/** A deliberately concise overview for the public landing page. */
export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      title="How it works"
      intro="Three simple steps to get started."
      tone="strong"
      className="pt-16 sm:pt-20"
    >
      <ol className="grid gap-5 md:grid-cols-3">
        {steps.map((step) => (
          <li
            key={step.number}
            className="rounded-card border border-line bg-surface p-6"
          >
            <span className="text-caption font-semibold text-brand">{step.number}</span>
            <h3 className="mt-4 text-title font-semibold">{step.title}</h3>
            <p className="mt-2 text-body text-foreground/70">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
