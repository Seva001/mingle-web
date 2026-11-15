import type { Metadata } from "next";
import { LegalDocument } from "@/components/marketing/legal-document";

export const metadata: Metadata = { title: "Community guidelines" };

export default function Page() {
  return <LegalDocument draftNotice={false} eyebrow="Community standards" title="Community guidelines" lead="Mingle is designed for adults who want to build respectful, intentional connections. These standards describe the behaviour expected in the community." sections={[
    { title: "Treat people with respect", paragraphs: ["Speak to other members with courtesy. Respect boundaries, identity, consent and a person’s decision not to continue a conversation."] },
    { title: "Be genuine", paragraphs: ["Do not impersonate another person, misrepresent your identity or intentions, use stolen images, or create deceptive accounts. Do not manipulate compatibility information to mislead other members."] },
    { title: "No harassment, hate or threats", paragraphs: ["Do not bully, stalk, intimidate, threaten, dox, blackmail or encourage harm. Slurs, dehumanising abuse and targeted harassment are not acceptable."] },
    { title: "No exploitation or scams", paragraphs: ["Do not request money through deception, promote fraudulent schemes, solicit financial credentials, exploit vulnerable people, or use Mingle to facilitate illegal activity."] },
    { title: "Protect privacy", paragraphs: ["Do not publish another person’s private information, share private conversations or images without permission, or pressure anyone to disclose sensitive information. Keep exact home and workplace locations private."] },
    { title: "Use reporting responsibly", paragraphs: ["Report behaviour that appears to violate these standards. Do not submit knowingly false or retaliatory reports. Use the in-product reporting tools to flag conduct that may violate these guidelines."] },
    { title: "Enforcement is not yet active", paragraphs: ["Mingle must establish trained moderation, evidence handling, appeals, response targets and an auditable enforcement process before opening member access. This page communicates intended standards; it does not claim that moderation is currently operational."] },
  ]} />;
}
