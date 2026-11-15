import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/marketing/page-header";
import { Section } from "@/components/marketing/section";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { compatibility } from "@/lib/marketing/landing";
import { journey } from "@/lib/marketing/pages";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Explore the Mingle journey, from creating a profile to building meaningful connections.",
};


/**
 * How It Works (F2.11). Static server component. The stages are a real sequence, so an ordered
 * list with visible step numbers is the clearest structure for the member journey.
 */
export default function HowItWorksPage() {
  const { limits, cta } = journey;

  return (
    <>
      <PageHeader
        id="journey-title"
        eyebrow={journey.eyebrow}
        title={journey.title}
        lead={journey.lead}
      />

      <section aria-label="The member journey" className="pt-24">
        <Container>
          <ol className="divide-y divide-line border-y border-line">
            {journey.stages.map((stage, index) => (
              <li
                key={stage.key}
                id={stage.key}
                className="grid scroll-mt-20 gap-8 py-10 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-12 md:py-14"
              >
                <div className="min-w-0">
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden
                      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand font-semibold text-on-brand"
                    >
                      {index + 1}
                    </span>
                    <h2
                      id={`${stage.key}-title`}
                      className="text-title font-semibold text-balance"
                    >
                      <span className="sr-only">Step {index + 1}: </span>
                      {stage.title}
                    </h2>
                  </div>
                  <p className="mt-4 max-w-prose text-body text-foreground/70">{stage.body}</p>
                  {stage.note ? (
                    <p className="mt-4 flex max-w-prose items-start gap-2 text-caption text-foreground/70">
                      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <span>{stage.note}</span>
                    </p>
                  ) : null}
                </div>

                <ul className="flex min-w-0 flex-col gap-3">
                  {stage.features.map((feature) => (
                    <li key={feature.title} className="min-w-0">
                      <Card className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <div className="min-w-0">
                          <h3 className="text-body font-semibold">{feature.title}</h3>
                          <p className="mt-1.5 max-w-prose text-caption text-foreground/70">
                            {feature.body}
                          </p>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <Section id={limits.id} title={limits.title} tone="strong">
        <Card className="max-w-3xl">
          <h3 className="text-title font-semibold">{compatibility.disclaimerTitle}</h3>
          <p className="mt-3 text-body text-foreground/70">{compatibility.disclaimer}</p>
          <p className="mt-4 text-body text-foreground/70">{compatibility.excluded}</p>
        </Card>
        <p className="mt-6 max-w-3xl text-caption text-foreground/70">{limits.changeNote}</p>
      </Section>

      <section aria-labelledby="journey-cta-title" className="py-24">
        <Container>
          <h2 id="journey-cta-title" className="font-display text-headline text-balance">
            {cta.title}
          </h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={cta.primary.href} size="lg" className="w-full sm:w-auto">
              {cta.primary.label}
            </ButtonLink>
            <ButtonLink
              href={cta.secondary.href}
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              {cta.secondary.label}
            </ButtonLink>
          </div>
          <div className="mt-6 flex max-w-xl flex-col gap-3 text-caption text-foreground/70">
            <p>
              Mingle is for adults aged 18 and over. See the{" "}
              <Link
                href={cta.safety.href}
                className="font-semibold text-foreground underline underline-offset-4"
              >
                {cta.safety.label}
              </Link>
              .
            </p>

          </div>
        </Container>
      </section>
    </>
  );
}
