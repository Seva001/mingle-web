import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { ButtonLink } from "@/components/ui/button";
import { heroCtas } from "@/lib/site";

/**
 * Landing hero (F2.3). Server component: no client state, so the page stays fully usable
 * without JavaScript. Contains no member counts, match statistics or testimonials, because none of that exists
 * yet (brief §15). The single hero photograph lives in HeroVisual.
 */
export function Hero() {

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* Single restrained brand glow; decorative only. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 size-[44rem] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 22%, transparent), transparent)",
        }}
      />
      <Container
        className="relative grid items-center gap-14 py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:py-24"
      >
        <div className="min-w-0">
          <p
            className="animate-rise inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-caption font-semibold text-foreground"
          >
            <ShieldCheck className="size-4 text-brand" aria-hidden />
            Compatibility-first · For adults 18+
          </p>

          <h1
            id="hero-title"
            className="animate-rise mt-6 font-display text-display text-balance"
            style={{ animationDelay: "60ms" }}
          >
            Someone wants to mingle with you, find out who.
          </h1>

          <p
            className="animate-rise mt-6 max-w-xl text-lead text-foreground/70"
            style={{ animationDelay: "120ms" }}
          >
            Meet people who share what matters to you.
          </p>

          <div
            className="animate-rise mt-9 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "180ms" }}
          >
            <ButtonLink href={heroCtas.primary.href} size="lg" className="w-full sm:w-auto">
              {heroCtas.primary.label}
            </ButtonLink>
            <ButtonLink
              href={heroCtas.secondary.href}
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              {heroCtas.secondary.label}
            </ButtonLink>
          </div>

          <div
            className="animate-rise mt-6 flex max-w-xl flex-col gap-3 text-caption text-foreground/70"
            style={{ animationDelay: "240ms" }}
          >
            <p>
              Mingle is for adults aged 18 and over. Already have an account?{" "}
              <Link
                href={heroCtas.signIn.href}
                className="font-semibold text-foreground underline underline-offset-4"
              >
                Sign in here
              </Link>
            </p>

          </div>
        </div>

        <div className="animate-rise min-w-0" style={{ animationDelay: "120ms" }}>
          <HeroVisual />
        </div>
      </Container>
    </section>
  );
}
