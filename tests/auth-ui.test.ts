import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("Supabase-connected authentication interfaces", () => {
  it("submits sign-up through the server action while preserving age and consent checks", () => {
    const source = read("components/forms/sign-up-form.tsx");
    expect(source).toContain('name="confirmPassword"');
    expect(source).toContain("Mingle is for adults aged 18 and over.");
    expect(source).toContain('name="terms"');
    expect(source).toContain('href="/terms"');
    expect(source).toContain('href="/privacy"');
    expect(source).toContain("useActionState(signUpAction");
  });

  it("submits sign-in through a server action and retains password recovery navigation", () => {
    const source = read("components/forms/sign-in-form.tsx");
    expect(source).toContain("showPasswordToggle");
    expect(source).toContain('href="/forgot-password"');
    expect(source).toContain("useActionState(signInAction");
  });

  it("connects recovery, reset and callback routes", () => {
    const forms = read("components/forms/password-recovery-forms.tsx");
    expect(forms).toContain("useActionState(forgotPasswordAction");
    expect(forms).toContain("useActionState(updatePasswordAction");
    expect(read("app/(auth)/forgot-password/page.tsx")).toContain("ForgotPasswordForm");
    expect(read("app/(auth)/reset-password/page.tsx")).toContain("supabase.auth.getUser()");
    expect(read("app/auth/callback/route.ts")).toContain("exchangeCodeForSession");
  });

  it("asks for no email code and has no separate age-check step after sign-up", () => {
    expect(existsSync(join(process.cwd(), "components/forms/verification-status.tsx"))).toBe(false);
    expect(existsSync(join(process.cwd(), "app/(auth)/verify/page.tsx"))).toBe(false);
    expect(read("components/forms/sign-up-form.tsx")).toContain("There is no email code to enter");
    expect(read("lib/auth/actions.ts")).toContain('redirect("/onboarding")');
  });

  it("is honest that the declared date of birth is not verification", () => {
    const source = read("app/(auth)/eligibility/page.tsx");
    expect(source).toContain("strictly for adults aged 18 and over");
    expect(source).toContain("A date of birth is a declaration");
    expect(source).toContain("does not verify your age");
  });

  it("protects member routes with a server-side access decision", () => {
    const source = read("app/(member)/layout.tsx");
    expect(source).toContain("await getMemberAccess()");
    expect(source).toContain("if (!access.allowed) redirect(access.destination)");
  });

  it("keeps password visibility controls keyboard-operable and labelled", () => {
    const source = read("components/ui/field.tsx");
    expect(source).toContain('type="button"');
    expect(source).toContain('aria-label={visible ? "Hide password" : "Show password"}');
    expect(source).toContain("aria-pressed={visible}");
  });
});

describe("contact form preview", () => {
  it("validates locally and explicitly states that messages are not delivered", () => {
    const source = read("components/forms/contact-form.tsx");
    expect(source).toContain("Enter a valid email address.");
    expect(source).toContain("at least 10 characters");
    expect(source).toContain("no message can be delivered");
    expect(source).toContain("Nothing was sent or stored");
    expect(source).not.toContain("fetch(");
  });
});
