import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/ui/logo";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { Demo } from "./demo";

export const metadata: Metadata = { title: "Design system" };

const surfaces = [
  { token: "background", cls: "bg-background border border-line", use: "Page" },
  { token: "surface", cls: "bg-surface border border-line", use: "Cards, controls" },
  { token: "surface-raised", cls: "bg-surface-raised border border-line", use: "Menus, pressed" },
  { token: "foreground", cls: "bg-foreground", use: "Primary text, active nav" },
  { token: "muted", cls: "bg-muted", use: "Secondary text" },
  { token: "brand", cls: "bg-brand", use: "Logo, likes, notification dots" },
  { token: "verified", cls: "bg-verified", use: "Verification" },
  { token: "star", cls: "bg-star", use: "Save" },
  { token: "danger", cls: "bg-danger", use: "Errors" },
  { token: "success", cls: "bg-success", use: "Success" },
];

export default function DesignSystemPage() {
  return (
    <>
      <header className="glass sticky top-0 z-30 border-x-0 border-t-0">
        <Container className="flex h-16 items-center justify-between">
          <Logo />
          <ThemeToggle />
        </Container>
      </header>

      <Container className="flex flex-col gap-14 py-12" id="main">
        <div className="max-w-2xl">
          <h1 className="font-display text-headline">Design system</h1>
          <p className="mt-3 text-lead text-muted">
            Every token and component below is shared by both themes. Switch themes above to check
            legibility. This page is hidden in production.
          </p>
        </div>

        <section aria-labelledby="colour" className="flex flex-col gap-5">
          <h2 id="colour" className="text-title font-semibold">
            Colour
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {surfaces.map((s) => (
              <li key={s.token}>
                <Card padded={false} className="overflow-hidden">
                  <div className={`h-20 ${s.cls}`} />
                  <div className="p-3">
                    <p className="text-caption font-semibold">{s.token}</p>
                    <p className="text-caption text-muted">{s.use}</p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="type" className="flex flex-col gap-5">
          <h2 id="type" className="text-title font-semibold">
            Typography
          </h2>
          <Card className="flex flex-col gap-5">
            <p className="font-display text-display">Display</p>
            <p className="font-display text-headline">Headline</p>
            <p className="font-display text-title">Title</p>
            <p className="max-w-prose text-lead">
              Lead. Mingle helps adults explore people whose intentions and values may align with
              theirs.
            </p>
            <p className="max-w-prose text-body">
              Body. Recommendations support discovery; they are not predictions of relationship
              outcomes.
            </p>
            <p className="text-caption text-muted">Caption and secondary information.</p>
          </Card>
        </section>

        <Demo />
      </Container>
    </>
  );
}
