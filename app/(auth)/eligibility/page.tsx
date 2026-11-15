import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { FormNotice } from "@/components/forms/form-notice";

export const metadata: Metadata = { title: "Account not open yet" };

export default function EligibilityPage() {
  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-headline">Your account isn’t open yet</h1>
      <p className="mt-3 text-lead text-muted">
        Mingle is strictly for adults aged 18 and over.
      </p>
      <Card className="mt-8 flex flex-col gap-5">
        <FormNotice tone="info">
          Member features open once your launch market opens and the date of birth you declared
          meets that market’s minimum age. Nothing else is needed from you.
        </FormNotice>
        <div>
          <h2 className="text-body font-semibold">A date of birth is a declaration</h2>
          <p className="mt-2 text-caption text-muted">
            Mingle does not verify your age with ID or a face scan. The date you entered at sign-up
            is a declaration only. Accounts found to belong to anyone under 18 are removed.
          </p>
        </div>
        <p className="text-caption text-muted">
          Read more in the <Link href="/help#age-eligibility" className="font-semibold text-foreground underline">age and eligibility help section</Link>.
        </p>
      </Card>
    </div>
  );
}
