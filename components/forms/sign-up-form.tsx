"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormNotice } from "@/components/forms/form-notice";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { signUpAction } from "@/lib/auth/actions";
import { initialAuthFormState } from "@/lib/auth/form-state";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation/auth";

type SignupMarket = { code: string; displayName: string; minimumAge: number };

export function SignUpForm({ markets }: { markets: SignupMarket[] }) {
  const [state, action, pending] = useActionState(signUpAction, initialAuthFormState);
  return (
    <form action={action} className="flex flex-col gap-5">
      <FormNotice tone="info">
        Create your account with your email and a password. There is no email code to enter. Your date of birth is stored privately as a declaration. Mingle does not check it against ID.
      </FormNotice>
      {state.message ? <FormNotice tone={state.status === "error" || state.status === "underage" ? "error" : "info"}>{state.message}</FormNotice> : null}
      <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={state.email} error={state.fieldErrors?.email} />
      <Field label="Password" name="password" type="password" showPasswordToggle autoComplete="new-password" required hint={`At least ${PASSWORD_MIN_LENGTH} characters. A few words together works well.`} error={state.fieldErrors?.password} />
      <Field label="Confirm password" name="confirmPassword" type="password" showPasswordToggle autoComplete="new-password" required error={state.fieldErrors?.confirmPassword} />
      <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
        Country
        <select name="marketCode" required defaultValue="" disabled={markets.length === 0}
          className="h-12 rounded-xl border border-border bg-surface px-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          <option value="" disabled>Select your country or market</option>
          {markets.map((market) => <option key={market.code} value={market.code}>{market.displayName} · {market.minimumAge}+ </option>)}
        </select>
        {state.fieldErrors?.marketCode ? <span className="text-caption font-medium text-danger">{state.fieldErrors.marketCode}</span> : null}
        <span className="text-caption text-muted">Choose the country you live in.</span>
      </label>
      {markets.length === 0 ? <FormNotice tone="info">Registration is not open in any market yet. Please check back when Mingle announces its first launch market.</FormNotice> : null}
      <Field label="Date of birth" name="dateOfBirth" type="date" autoComplete="bday" required hint="Mingle is for adults aged 18 and over. We take your date as a declaration and do not verify it with ID." error={state.fieldErrors?.dateOfBirth} />
      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-3 text-caption text-foreground">
          <input type="checkbox" name="terms" required aria-invalid={state.fieldErrors?.terms ? true : undefined} className="mt-0.5 size-5 shrink-0 accent-brand" />
          <span>I’m 18 or over and I agree to the <Link href="/terms" className="font-semibold underline">Terms of service</Link> and have read the <Link href="/privacy" className="font-semibold underline">Privacy policy</Link>.</span>
        </label>
        {state.fieldErrors?.terms ? <p className="text-caption font-medium text-danger">{state.fieldErrors.terms}</p> : null}
      </div>
      <Button type="submit" size="lg" loading={pending} disabled={markets.length === 0}>Create account</Button>
      <p className="text-caption text-muted">Already a member? <Link href="/sign-in" className="font-semibold text-foreground underline">Sign in</Link></p>
    </form>
  );
}
