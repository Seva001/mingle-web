import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { PageHeader } from "@/components/marketing/page-header";
import { Card } from "@/components/ui/card";
import { faq } from "@/lib/marketing/support";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Short answers about age eligibility, compatibility, privacy, accounts and availability, based on what Mingle is today.",
};

/**
 * FAQ (F2.13). The page itself is a server component; only the accordion is a client component
 * (it needs open/closed state and keyboard handling). The category index is plain in-page links.
 * Answers say what is true today and never promise safety, outcomes or dates (brief §15).
 */
export default function FaqPage() {
  const { categories, more } = faq;

  return (
    <>
      <PageHeader id="faq-title" eyebrow={faq.eyebrow} title={faq.title} lead={faq.lead}>
        <p className="mt-8 flex max-w-2xl items-start gap-3 rounded-control border border-line bg-surface p-4 text-caption text-foreground/70">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{faq.note}</span>
        </p>
      </PageHeader>

      <Container className="pt-14 pb-24 sm:pt-20">
        <nav aria-label="FAQ topics" className="mb-12">
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.id} className="min-w-0">
                <a
                  href={`#${category.id}`}
                  className="inline-flex min-h-11 items-center rounded-control border border-line px-4 text-caption font-semibold hover:bg-foreground/10"
                >
                  {category.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl">
          <FaqAccordion categories={categories} controls={faq.controls} />
        </div>

        <Card className="mt-20 max-w-3xl">
          <h2 className="text-title font-semibold">{more.title}</h2>
          <p className="mt-3 max-w-prose text-body text-foreground/70">{more.body}</p>
          <p className="mt-4 text-caption">
            <Link
              href={more.link.href}
              className="font-semibold text-foreground underline underline-offset-4"
            >
              {more.link.label}
            </Link>
          </p>
        </Card>
      </Container>
    </>
  );
}
