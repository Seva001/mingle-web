import { cn } from "@/lib/utils";

/**
 * PROVISIONAL mark: two overlapping circles, one solid, one outlined.
 * The final logo is still an open decision in the brief (§17).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 24" className={cn("h-6 w-8", className)} aria-hidden>
      <circle cx="11" cy="12" r="9" fill="var(--brand)" />
      <circle cx="21" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-foreground", className)}>
      <LogoMark />
      <span className="font-display text-title leading-none">Mingle</span>
    </span>
  );
}
