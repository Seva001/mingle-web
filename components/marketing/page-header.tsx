import { Container } from "@/components/layout/container";

type PageHeaderProps = {
  id: string;
  eyebrow: string;
  title: string;
  lead: React.ReactNode;
  children?: React.ReactNode;
};

/**
 * Top of a standalone marketing page (F2.10, F2.11). Renders the page's single `<h1>`.
 * Secondary text uses text-foreground/70, because light-theme text-muted is below AA on the
 * page background (docs/DESIGN_SYSTEM.md).
 */
export function PageHeader({ id, eyebrow, title, lead, children }: PageHeaderProps) {
  return (
    <header aria-labelledby={id} className="pt-14 sm:pt-20">
      <Container>
        <div className="max-w-3xl">
          <p className="mb-4 text-caption font-semibold text-foreground/70">{eyebrow}</p>
          <h1 id={id} className="font-display text-display text-balance">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lead text-foreground/70">{lead}</p>
          {children}
        </div>
      </Container>
    </header>
  );
}
