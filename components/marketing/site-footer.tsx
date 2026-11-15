import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { authLinks, copyrightLine, footerGroups } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <Container
        className="grid gap-12 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-16"
      >
        <div className="flex flex-col items-start gap-5">
          <Link href="/" aria-label="Mingle home" className="shrink-0">
            <Logo />
          </Link>
          <p className="max-w-xs text-caption text-foreground/70">
            A compatibility-first way to meet people, made with intention. For adults 18+.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink href={authLinks.getStarted.href} size="sm">
              {authLinks.getStarted.label}
            </ButtonLink>
            <ButtonLink href={authLinks.signIn.href} variant="ghost" size="sm">
              {authLinks.signIn.label}
            </ButtonLink>
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title} className="min-w-0">
              <h2 className="text-caption font-semibold text-foreground">{group.title}</h2>
              <ul className="mt-3 flex flex-col">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-block py-1.5 text-caption text-foreground/70 underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Container>

      <Container
        className="flex flex-col items-start gap-4 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-caption text-foreground/70">{copyrightLine(new Date().getFullYear())}</p>
        <ThemeToggle />
      </Container>
    </footer>
  );
}
