import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/marketing/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Pricing" };

export default function Page() {
  return <>
    <PageHeader id="pricing-title" eyebrow="Plans and availability" title="Pricing is not published yet" lead="Mingle is still in product development. We will publish clear plan details only after the core experience, support model and operating costs have been validated." />
    <Container className="pb-24 pt-10">
      <Card className="max-w-2xl">
        <h2 className="text-title font-semibold">No paid plans are available</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Mingle will publish transparent plan details before introducing any paid features.</p>
      </Card>
    </Container>
  </>;
}
