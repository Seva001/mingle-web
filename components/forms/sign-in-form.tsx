"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormNotice } from "@/components/forms/form-notice";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { signInAction } from "@/lib/auth/actions";
import { initialAuthFormState } from "@/lib/auth/form-state";

export function SignInForm() {
  const [state, action, pending] = useActionState(signInAction, initialAuthFormState);
  return (
    <form action={action} className="flex flex-col gap-5">
      {state.message ? <FormNotice tone="error">{state.message}</FormNotice> : null}
      <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={state.email} error={state.fieldErrors?.email} />
      <Field label="Password" name="password" type="password" showPasswordToggle autoComplete="current-password" required error={state.fieldErrors?.password} />
      <p className="-mt-2 text-right text-caption"><Link href="/forgot-password" className="font-semibold text-foreground underline">Forgot password?</Link></p>
      <Button type="submit" size="lg" loading={pending}>Sign in</Button>
      <p className="text-caption text-muted">New to Mingle? <Link href="/sign-up" className="font-semibold text-foreground underline">Create an account</Link></p>
    </form>
  );
}
