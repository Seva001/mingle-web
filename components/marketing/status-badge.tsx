import { Check, Clock, Wrench, type LucideIcon } from "lucide-react";
import { featureStatuses, type FeatureStatus } from "@/lib/marketing/pages";

const icons: Record<FeatureStatus, LucideIcon> = {
  preview: Check,
  development: Wrench,
  planned: Clock,
};

/**
 * Feature status label (F2.11). Status is carried by the words and a distinct icon shape, never
 * by colour alone. "Available in preview" is the only filled style, so what works today stands
 * out without implying anything is live. Colours come from theme tokens only.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: FeatureStatus;
  className?: string;
}) {
  const Icon = icons[status];
  // Joined directly, not through cn(): the default tailwind-merge config does not know the
  // custom text-caption size, reads it as a colour and drops one of the two classes.
  const classes = [
    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-caption font-semibold whitespace-nowrap",
    status === "preview"
      ? "border-transparent bg-foreground text-background"
      : status === "development"
        ? "border-foreground/40 bg-surface text-foreground"
        : "border-dashed border-foreground/40 bg-transparent text-foreground",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <Icon className="size-3.5" aria-hidden />
      {featureStatuses[status].label}
    </span>
  );
}
