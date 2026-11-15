import Link from "next/link";
import { Settings } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { IconLink } from "@/components/ui/icon-button";
import { BottomNav, SideNav } from "@/components/navigation/member-nav";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";

/** App chrome for signed-in screens: top bar, side rail (desktop), floating nav (mobile). */
export function MemberShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-6xl md:grid md:grid-cols-[14rem_1fr] md:gap-10 md:px-8">
      <aside className="hidden md:block md:pt-8">
        <Link href="/discover" aria-label="Mingle home" className="mb-10 inline-block px-4">
          <Logo />
        </Link>
        <SideNav />
      </aside>

      <div className="px-5 pb-32 md:px-0 md:pb-12">
        <header className="flex h-16 items-center justify-between md:h-24">
          <Link href="/discover" aria-label="Mingle home" className="md:hidden">
            <Logo />
          </Link>
          <span className="hidden md:block" />
          <div className="flex items-center gap-2">
            <form action={signOutAction}><Button type="submit" variant="ghost" size="sm">Sign out</Button></form>
            <IconLink href="/settings" label="Settings" variant="surface">
              <Settings className="size-5" aria-hidden />
            </IconLink>
          </div>
        </header>
        <main id="main">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
