"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memberNavItems } from "@/components/navigation/items";
import { cn } from "@/lib/utils";

function useActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

/** Mobile: floating glass pill, clear of the home indicator. Hidden from md up. */
export function BottomNav() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <ul className="glass pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-full p-1.5 shadow-float">
        {memberNavItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[0.6875rem] font-semibold transition-colors duration-150",
                  active ? "bg-foreground text-background" : "text-muted hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Desktop: a side rail, not a stretched phone layout (brief §11). Hidden below md. */
export function SideNav() {
  const isActive = useActive();
  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul className="flex flex-col gap-1">
        {memberNavItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-12 items-center gap-3 rounded-control px-4 text-body font-semibold transition-colors duration-150",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted hover:bg-foreground/10 hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
