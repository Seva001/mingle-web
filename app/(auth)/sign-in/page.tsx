import type { Metadata } from "next";
import { SignInForm } from "@/components/forms/sign-in-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-headline">Welcome back</h1>
      <p className="mt-3 text-lead text-muted">Sign in to continue.</p>
      <Card className="mt-8">
        <SignInForm />
      </Card>
    </div>
  );
}
