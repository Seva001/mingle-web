import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  title: string;
  /** Rendered as a small label above the title. */
  eyebrow?: string;
  intro?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /**
   * "strong" renders the eyebrow and intro at text-foreground/70 instead of text-muted.
   * In the light theme muted is 4.26:1 on the page background (below AA 4.5:1 for small text).
   */
  tone?: "default" | "strong";
};

export function Section({
  id,
  title,
  eyebrow,
  intro,
  children,
  className,
  tone = "default",
}: SectionProps) {
  const secondary = tone === "strong" ? "text-foreground/70" : "text-muted";
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      className={cn("scroll-mt-20 pt-24", className)}
    >
      <Container>
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className={cn("mb-3 text-caption font-semibold", secondary)}>{eyebrow}</p>
          ) : null}
          <h2 id={id ? `${id}-title` : undefined} className="font-display text-headline">
            {title}
          </h2>
          {intro ? <p className={cn("mt-5 text-lead", secondary)}>{intro}</p> : null}
        </div>
        {children ? <div className="mt-12">{children}</div> : null}
      </Container>
    </section>
  );
}
