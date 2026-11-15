"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormNotice } from "@/components/forms/form-notice";
import { forgotPasswordAction, updatePasswordAction } from "@/lib/auth/actions";
import { initialAuthFormState } from "@/lib/auth/form-state";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation/auth";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initialAuthFormState);
  return (
    <form className="flex flex-col gap-5" action={action}>
      {state.message ? <FormNotice tone="info">{state.message}</FormNotice> : null}
      {state.fieldErrors?.email ? <FormNotice tone="error">{state.fieldErrors.email}</FormNotice> : null}
      <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={state.email} />
      <Button type="submit" size="lg" loading={pending}>Request reset link</Button>
      <p className="text-caption text-muted">Remembered your password? <Link href="/sign-in" className="font-semibold text-foreground underline">Sign in</Link></p>
    </form>
  );
}

export function ResetPasswordForm({ linkPresent }: { linkPresent: boolean }) {
  const [state, action, pending] = useActionState(updatePasswordAction, initialAuthFormState);
  return (
    <form className="flex flex-col gap-5" action={action}>
      {!linkPresent ? <FormNotice tone="error">This reset link is missing. Request a new password reset email.</FormNotice> : <FormNotice tone="info">Choose a new password for your account.</FormNotice>}
      {state.message ? <FormNotice tone="error">{state.message}</FormNotice> : null}
      <Field label="New password" name="password" type="password" showPasswordToggle autoComplete="new-password" required hint={`At least ${PASSWORD_MIN_LENGTH} characters.`} error={state.fieldErrors?.password} />
      <Field label="Confirm new password" name="confirmPassword" type="password" showPasswordToggle autoComplete="new-password" required error={state.fieldErrors?.confirmPassword} />
      <Button type="submit" size="lg" disabled={!linkPresent} loading={pending}>Update password</Button>
      <p className="text-caption text-muted">Return to <Link href="/sign-in" className="font-semibold text-foreground underline">sign in</Link>.</p>
    </form>
  );
}
