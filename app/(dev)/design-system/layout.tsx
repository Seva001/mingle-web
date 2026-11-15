import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Visible in local development and on preview deployments only.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  const allowed =
    process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_APP_ENV === "preview";
  if (!allowed) notFound();
  return children;
}
