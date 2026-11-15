import type { Metadata } from "next";
import { LegalDocument } from "@/components/marketing/legal-document";

export const metadata: Metadata = { title: "Privacy policy — draft" };

export default function Page() {
  return <LegalDocument title="Privacy policy" lead="An outline of the privacy information Mingle must provide before any real member accounts are opened." sections={[
    { title: "Who operates Mingle", paragraphs: ["The legal name, registered address and contact details of the Mingle operator must be inserted here before launch. This information has not yet been supplied in the project materials."] },
    { title: "Information we may need", paragraphs: ["The final notice must describe each category of information collected, why it is needed, whether it is optional, and the lawful basis for processing. It must distinguish account details, profile content, safety reports, device and diagnostic data, and the date of birth declared at sign-up.", "The product is intended strictly for adults aged 18 and over. The date of birth declared at sign-up is stored privately and is not age verification; Mingle does not collect identity documents or face scans for age checks. The operator must document how the declared date is stored, how long it is kept and how an account removed for being under 18 is handled before launch."] },
    { title: "How information is used and shared", paragraphs: ["The final notice must identify each purpose, the service providers or recipient categories involved, international transfers, and any advertising or analytics use. Do not assume that data is shared with or withheld from a category of recipient until the production architecture is confirmed."] },
    { title: "Retention, security and your choices", paragraphs: ["The operator must define retention periods, deletion schedules, security controls, access and correction procedures, account closure, export requests and complaint handling. These controls govern how personal information is protected, retained and managed throughout the member lifecycle."] },
    { title: "Contact and complaints", paragraphs: ["Insert a monitored privacy contact and the applicable regulator or complaint route after the operator and launch jurisdictions are confirmed. Privacy enquiries should be directed through the designated privacy contact published by the Mingle operator."] },
  ]} />;
}
