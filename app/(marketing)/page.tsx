import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";

export const metadata: Metadata = {
  title: { absolute: "Mingle: Someone wants to mingle with you, find out who." },
  description: "Meet people through shared interests and intentions. For adults 18+.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
    </>
  );
}
