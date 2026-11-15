import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/marketing/page-header";
import { ReportForm } from "@/components/safety/report-form";

export const metadata: Metadata = { title: "Report a concern" };

export default function Page() {
  return <>
    <PageHeader id="report-title" eyebrow="Safety" title="Report a concern" lead="Report harassment, impersonation, threats, scams or other safety concerns to the MINGLE team. You must be signed in with an active account to submit a report." />
    <Container className="pb-24 pt-10"><div className="max-w-2xl"><ReportForm /></div></Container>
  </>;
}
