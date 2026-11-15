import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { finalCta } from "@/lib/marketing/landing";

/**
 * Closing call to action (F2.5). Plain links only: no form, no client state and no simulated
 * success. While no account backend exists it says so, using the same helper as the hero so the
 * two can never disagree (brief §15).
 */
export function FinalCta() {

  return (
    <section id={finalCta.id} aria-labelledby="final-cta-title" className="scroll-mt-20 pt-24">
      <Container>
        <div className="relative overflow-hidden rounded-card border border-line bg-surface p-8 shadow-card sm:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -bottom-32 size-96 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 30%, transparent), transparent)",
            }}
          />
          <div className="relative max-w-2xl">
            <h2 id="final-cta-title" className="font-display text-headline text-balance">
              {finalCta.title}
            </h2>
            <p className="mt-5 text-lead text-foreground/70">{finalCta.body}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href={finalCta.primary.href}
                size="lg"
                className="w-full sm:w-auto"
              >
                {finalCta.primary.label}
              </ButtonLink>
              <ButtonLink
                href={finalCta.safety.href}
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {finalCta.safety.label}
              </ButtonLink>
            </div>

            <div className="mt-6 flex flex-col gap-3 text-caption text-foreground/70">
              <p>
                {finalCta.adultLine} Already have an account?{" "}
                <Link
                  href={finalCta.signIn.href}
                  className="font-semibold text-foreground underline underline-offset-4"
                >
                  Sign in here
                </Link>
              </p>

            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
