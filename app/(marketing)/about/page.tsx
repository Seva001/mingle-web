import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { Section } from "@/components/marketing/section";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { compatibility } from "@/lib/marketing/landing";
import { about } from "@/lib/marketing/pages";

export const metadata: Metadata = {
  title: "About Mingle",
  description:
    "Why Mingle exists, what it believes and how it brings adults together through compatibility-first discovery.",
};

/**
 * About (F2.10). Static server component. Purpose, philosophy, audience and direction only:
 * no founders, company history, dates, awards, statistics or testimonials, because none are
 * supplied (brief §15). Written as intent, with the build status stated up front.
 */
export default function AboutPage() {
  const { purpose, philosophy, lines, audience, direction, status } = about;

  return (
    <>
      <PageHeader id="about-title" eyebrow={about.eyebrow} title={about.title} lead={about.lead}>
        <p className="mt-8 flex max-w-2xl items-start gap-3 rounded-control border border-line bg-surface p-4 text-caption text-foreground/70">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <span className="font-semibold text-foreground">{status.title}. </span>
            {status.body}
          </span>
        </p>
      </PageHeader>

      <Section id={purpose.id} title={purpose.title} tone="strong">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          <div className="flex min-w-0 max-w-prose flex-col gap-5 text-body text-foreground/70">
            {purpose.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Card className="min-w-0 self-start lg:p-8">
            <p className="font-display text-title text-balance">{purpose.statement}</p>
          </Card>
        </div>
      </Section>

      <Section id={philosophy.id} title={philosophy.title} intro={philosophy.lead} tone="strong">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {philosophy.principles.map((principle) => (
            <li key={principle.title} className="min-w-0">
              <Card className="h-full">
                <h3 className="text-title font-semibold text-balance">{principle.title}</h3>
                <p className="mt-3 text-body text-foreground/70">{principle.body}</p>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-card border border-line bg-surface p-5 sm:p-6">
          <h3 className="text-body font-semibold">{lines.title}</h3>
          <p className="mt-1 text-caption text-foreground/70">{lines.lead}</p>
          <ul className="mt-4 flex list-disc flex-col gap-2.5 pl-5 text-foreground/70 marker:text-foreground/60">
            {[...lines.items, compatibility.excluded].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id={audience.id} title={audience.title} tone="strong">
        <div className="max-w-prose">
          <p className="text-body text-foreground/70">{audience.body}</p>
          <p className="mt-5 text-body text-foreground/70">{audience.note}</p>
        </div>
      </Section>

      <Section id={direction.id} title={direction.title} intro={direction.lead} tone="strong">
        <ol className="divide-y divide-line border-y border-line">
          {direction.stages.map((stage, index) => (
            <li
              key={stage.title}
              className="grid gap-4 py-7 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12"
            >
              <div className="flex min-w-0 items-start gap-4">
                <span
                  aria-hidden
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand font-semibold text-on-brand"
                >
                  {index + 1}
                </span>
                <h3 className="text-title font-semibold text-balance">
                  <span className="sr-only">Stage {index + 1}: </span>
                  {stage.title}
                </h3>
              </div>
              <p className="min-w-0 max-w-prose text-body text-foreground/70">{stage.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 max-w-3xl rounded-control border border-line bg-surface p-4 text-caption text-foreground/70">
          <span className="font-semibold text-foreground">{direction.openTitle}. </span>
          {direction.open}
        </div>
      </Section>

      <section aria-label="Next steps" className="py-24">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={about.links.primary.href} size="lg" className="w-full sm:w-auto">
              {about.links.primary.label}
            </ButtonLink>
            <ButtonLink
              href={about.links.secondary.href}
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              {about.links.secondary.label}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
