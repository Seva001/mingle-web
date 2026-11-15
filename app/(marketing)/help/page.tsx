import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/marketing/page-header";
import { Card } from "@/components/ui/card";
import { help, supportStatus, type HelpTopic } from "@/lib/marketing/support";

export const metadata: Metadata = {
  title: "Help",
  description:
    "Guidance on how Mingle is meant to work, grouped by topic, with an honest account of what exists today.",
};

const linkClass = "font-semibold text-foreground underline underline-offset-4";

/**
 * Help (F2.12). Static server component. Guidance is grouped into topics, each with an anchor,
 * and a section index lets visitors jump to one (a plain list of in-page links, so it works
 * without JavaScript). No support channel is invented: the Contact and support section says
 * that none is published yet (brief §15). The page is not a legal document and makes no
 * promise about response times, safety or outcomes.
 */
export default function HelpPage() {
  const topics: readonly HelpTopic[] = help.topics;
  const sections = [
    ...topics.map((t) => ({ id: t.id, title: t.title })),
    { id: supportStatus.id, title: supportStatus.title },
  ];

  return (
    <>
      <PageHeader id="help-title" eyebrow={help.eyebrow} title={help.title} lead={help.lead}>
        <p className="mt-8 flex max-w-2xl items-start gap-3 rounded-control border border-line bg-surface p-4 text-caption text-foreground/70">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <span className="font-semibold text-foreground">{help.status.title}. </span>
            {help.status.body}
          </span>
        </p>
      </PageHeader>

      <Container className="pt-14 pb-24 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:gap-16">
          <aside className="min-w-0">
            <nav aria-labelledby="help-nav-title" className="lg:sticky lg:top-24">
              <p id="help-nav-title" className="mb-3 text-caption font-semibold text-foreground/70">
                {help.navTitle}
              </p>
              <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-0.5">
                {sections.map((section) => (
                  <li key={section.id} className="min-w-0">
                    <a
                      href={`#${section.id}`}
                      className="inline-flex min-h-11 items-center rounded-control border border-line px-4 text-caption font-semibold hover:bg-foreground/10 lg:w-full lg:border-transparent lg:px-3"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
                <li className="min-w-0 lg:mt-3">
                  <Link
                    href={help.faqLink.href}
                    className="inline-flex min-h-11 items-center rounded-control border border-line bg-surface px-4 text-caption font-semibold hover:bg-foreground/10 lg:w-full lg:px-3"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>

          <div className="flex min-w-0 flex-col gap-16">
            {topics.map((topic) => (
              <section
                key={topic.id}
                id={topic.id}
                aria-labelledby={`${topic.id}-title`}
                className="scroll-mt-20"
              >
                <h2 id={`${topic.id}-title`} className="font-display text-headline">
                  {topic.title}
                </h2>
                <p className="mt-3 max-w-prose text-lead text-foreground/70">{topic.summary}</p>
                <Card className="mt-6">
                  <ul className="divide-y divide-line">
                    {topic.items.map((item) => (
                      <li key={item.title} className="min-w-0 py-5 first:pt-0 last:pb-0">
                        <h3 className="text-body font-semibold">{item.title}</h3>
                        <p className="mt-1.5 max-w-prose text-body text-foreground/70">
                          {item.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Card>
                {topic.links ? (
                  <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-caption">
                    {topic.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className={linkClass}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <section
              id={supportStatus.id}
              aria-labelledby={`${supportStatus.id}-title`}
              className="scroll-mt-20"
            >
              <h2 id={`${supportStatus.id}-title`} className="font-display text-headline">
                {supportStatus.title}
              </h2>
              <Card className="mt-6">
                <p className="text-lead font-semibold text-balance">{supportStatus.lead}</p>
                <p className="mt-3 max-w-prose text-body text-foreground/70">
                  {supportStatus.body}
                </p>
                <p className="mt-4 flex max-w-prose items-start gap-2 text-caption text-foreground/70">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>{supportStatus.emergency}</span>
                </p>
              </Card>
              <p className="mt-5 text-caption">
                <Link href={help.faqLink.href} className={linkClass}>
                  {help.faqLink.label}
                </Link>
              </p>
            </section>
          </div>
        </div>
      </Container>
    </>
  );
}
