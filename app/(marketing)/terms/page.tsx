import type { Metadata } from "next";
import { LegalDocument } from "@/components/marketing/legal-document";

export const metadata: Metadata = { title: "Terms of service — draft" };

export default function Page() {
  return <LegalDocument title="Terms of service" lead="The proposed framework for using Mingle. These terms are not yet in force." sections={[
    { title: "Eligibility and accounts", paragraphs: ["Mingle is intended only for adults aged 18 and over. Members declare their date of birth when they sign up, and accounts of anyone found to be under 18 will be removed. Mingle does not verify age with identity documents, and a self-declared date of birth is not proof of age.", "The operator must specify account creation, account security, suspension, appeal and account-closure procedures before these terms can be published."] },
    { title: "Member conduct", paragraphs: ["Members must provide truthful information, respect other people’s boundaries, use the service lawfully and follow the Community Guidelines. Impersonation, harassment, threats, scams, exploitation and discriminatory abuse are not acceptable."] },
    { title: "Content and permissions", paragraphs: ["The final terms must explain who owns member-submitted content, what limited licence is required to operate the service, how content can be removed, and how intellectual-property complaints are handled. No final licence is granted by this draft."] },
    { title: "Safety, moderation and availability", paragraphs: ["The operator must define report review, blocking, moderation, emergency escalation, service availability, prohibited uses and appeal processes. These capabilities are essential to member protection and must be applied consistently across the service."] },
    { title: "Liability, disputes and changes", paragraphs: ["Qualified counsel must prepare the governing law, jurisdiction, dispute process, limitation of liability, warranty disclaimers, termination provisions and change-notice rules for each intended launch market."] },
  ]} />;
}
