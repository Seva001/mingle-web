import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/marketing/page-header";
import { Card } from "@/components/ui/card";

type LegalSection = { title: string; paragraphs: string[]; bullets?: string[] };

export function LegalDocument({
  eyebrow = "Important information",
  title,
  lead,
  sections,
  draftNotice = true,
}: {
  eyebrow?: string;
  title: string;
  lead: string;
  sections: LegalSection[];
  draftNotice?: boolean;
}) {
  return (
    <>
      <PageHeader id="document-title" eyebrow={eyebrow} title={title} lead={lead} />
      <Container className="pb-24 pt-10">
        {draftNotice ? (
          <Card className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold">Draft — not a published legal policy</p>
            <p className="mt-2 text-sm leading-6 text-muted">This page is an implementation draft for product review. It is not legal advice and must be reviewed by qualified counsel and the Mingle operator before launch. Do not rely on it as the final agreement or privacy notice.</p>
          </Card>
        ) : null}
        <div className="max-w-3xl space-y-8">
          {sections.map((section, index) => (
            <section key={section.title} aria-labelledby={`document-section-${index}`}>
              <h2 id={`document-section-${index}`} className="text-title font-semibold">{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-3 text-sm leading-7 text-muted">{paragraph}</p>)}
              {section.bullets ? <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
