import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/forms/password-recovery-forms";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  await searchParams;
  let linkPresent = false;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    linkPresent = Boolean(data.user);
  } catch {
    linkPresent = false;
  }
  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-headline">Choose a new password</h1>
      <p className="mt-3 text-lead text-muted">Use a password you haven’t used here before.</p>
      <Card className="mt-8"><ResetPasswordForm linkPresent={linkPresent} /></Card>
    </div>
  );
}
