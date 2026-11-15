import type { Metadata } from "next";
import { SignUpForm } from "@/components/forms/sign-up-form";
import { Card } from "@/components/ui/card";
import { getEnabledMarkets } from "@/lib/markets/server";

export const metadata: Metadata = { title: "Create your account" };

export default async function Page() {
  const markets = await getEnabledMarkets();
  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-headline">Create your account</h1>
      <p className="mt-3 text-lead text-muted">Mingle is for adults aged 18 and over.</p>
      <Card className="mt-8">
        <SignUpForm markets={markets} />
      </Card>
    </div>
  );
}
