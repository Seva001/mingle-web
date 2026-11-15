import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/forms/password-recovery-forms";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-headline">Forgot your password?</h1>
      <p className="mt-3 text-lead text-muted">Enter the email address associated with your account.</p>
      <Card className="mt-8"><ForgotPasswordForm /></Card>
    </div>
  );
}
