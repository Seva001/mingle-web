import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="flex min-h-dvh flex-col gap-10 py-8">
      <Link href="/" aria-label="Mingle home" className="w-fit">
        <Logo />
      </Link>
      <main id="main" className="flex flex-1 items-start">
        {children}
      </main>
    </Container>
  );
}
