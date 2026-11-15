import { Check, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Verified indicator: a blue disc with a check. Never colour alone.
 * Verification has limits; link to the Safety centre wherever this is explained.
 */
export function VerifiedBadge({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      role="img"
      aria-label="Verified member"
      title="Verified member"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-verified text-on-verified",
        size === "sm" ? "size-4" : "size-5",
        className,
      )}
    >
      <Check className={size === "sm" ? "size-2.5" : "size-3"} strokeWidth={3.5} aria-hidden />
    </span>
  );
}

/**
 * Compatibility badge. Takes a plain-language label ("Similar lifestyle")
 * rather than a percentage: recommendations are not predictions or guarantees.
 */
export function CompatibilityBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "glass-photo inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption font-medium",
        className,
      )}
    >
      <HeartHandshake className="size-3.5 text-brand" aria-hidden />
      {children}
    </span>
  );
}

/** Small count/dot for notifications. The brand accent is reserved for exactly this kind of use. */
export function NotificationDot({ count, label }: { count?: number; label: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className="inline-flex min-w-2.5 items-center justify-center rounded-full bg-brand px-1 text-[0.6875rem] leading-4 font-bold text-on-brand"
    >
      {count !== undefined ? count : <span className="size-2.5" />}
    </span>
  );
}
