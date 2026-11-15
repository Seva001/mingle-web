import type { Metadata } from "next";
import { LegalDocument } from "@/components/marketing/legal-document";

export const metadata: Metadata = { title: "Cookie information" };

export default function Page() {
  return <LegalDocument title="Cookie and browser storage information" lead="How Mingle uses cookies and similar technologies." sections={[
    { title: "Cookies and similar technologies", paragraphs: ["Mingle may use essential cookies and similar technologies to support account security, session management, preferences and core service functionality.", "Any optional analytics or advertising technologies will be disclosed with the relevant choices and controls required in the markets where Mingle operates."] },
    { title: "Essential and optional storage", paragraphs: ["Before launch, the operator must inventory cookies, local storage, session storage, embedded services and any similar technologies. Each item must have a documented purpose, duration, provider and consent requirement for the markets served."] },
    { title: "Managing browser data", paragraphs: ["You can manage or delete cookies through your browser settings. Some site features may not function as intended if essential cookies are blocked."] },
    { title: "Consent controls", paragraphs: ["A production preference centre, where legally required, must be implemented and tested before any non-essential tracking is enabled. No consent preference is saved by this page."] },
  ]} />;
}
