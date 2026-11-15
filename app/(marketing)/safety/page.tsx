import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/marketing/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Safety centre" };

const topics = [
  ["Keep personal information private", "Avoid sharing passwords, financial details, identity documents, verification codes or your exact home address. Be thoughtful about what appears in profile photos and public conversations."],
  ["Take your time", "Keep early conversations on-platform when the service is operational. Do not feel pressured to move to another channel, meet in person, share images or make financial commitments."],
  ["Meet with care", "If you choose to meet someone, consider a public place, tell someone you trust about your plans, arrange your own transport and leave if you feel uncomfortable."],
  ["Watch for scams and coercion", "Be cautious of urgent requests for money, investment opportunities, requests for account access, threats, blackmail or attempts to isolate you from trusted people."],
  ["Get urgent help when needed", "If someone is in immediate danger, contact the appropriate emergency services in your location. Mingle is not an emergency-response service."],
];

export default function Page() {
  return <>
    <PageHeader id="safety-title" eyebrow="Your wellbeing matters" title="Safety centre" lead="Practical guidance for protecting your privacy, boundaries and wellbeing while building connections." />
    <Container className="pb-24 pt-10">
      <div className="grid max-w-4xl gap-4 md:grid-cols-2">
        {topics.map(([title, description]) => <Card key={title}><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted">{description}</p></Card>)}
      </div>
      <Card className="mt-6 max-w-4xl">
        <h2 className="text-title font-semibold">Report a concern</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Use the reporting tools to raise concerns about harassment, impersonation, threats, scams or other behaviour that may put a member at risk. For immediate danger, contact local emergency services.</p>
      </Card>
      <p className="mt-6 max-w-4xl text-caption leading-6 text-muted">Mingle is strictly for adults aged 18 and over. Member protection, reporting and responsible moderation are central to the Mingle experience. Mingle does not verify ages with ID checks, so please report anyone who appears to be under 18.</p>
    </Container>
  </>;
}
