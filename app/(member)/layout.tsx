import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MemberShell } from "@/components/layout/member-shell";
import { clearMemberSession, getMemberAccess } from "@/lib/auth/member-access";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const access = await getMemberAccess();
  if (!access.allowed) {
    if (access.reason === "account_blocked") {
      await clearMemberSession();
    }
    redirect(access.destination);
  }
  return <MemberShell>{children}</MemberShell>;
}
