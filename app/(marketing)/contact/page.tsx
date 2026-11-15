import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/marketing/page-header";
import { Card } from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the Mingle team.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        id="contact-title"
        eyebrow="Contact"
        title="Get in touch"
        lead="Send a message to the Mingle team. We welcome questions, feedback and enquiries."
      />
      <Container className="pt-12 pb-24 sm:pt-16">
        <Card className="max-w-2xl"><ContactForm /></Card>
      </Container>
    </>
  );
}
