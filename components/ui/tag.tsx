"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Static label (interests, lifestyle). */
export function Tag({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-caption font-medium text-foreground",
        className,
      )}
      {...props}
    />
  );
}

type ChipProps = Omit<React.ComponentProps<"button">, "onChange"> & {
  selected: boolean;
  onSelectedChange: (next: boolean) => void;
};

/** Toggleable choice. Selection shows a check mark and inverted fill, not colour alone. */
export function Chip({ selected, onSelectedChange, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelectedChange(!selected)}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-caption font-medium transition-colors duration-150",
        selected
          ? "border-foreground bg-foreground text-background"
          : "border-line bg-surface text-foreground hover:bg-surface-raised",
        className,
      )}
      {...props}
    >
      {selected ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : null}
      {children}
    </button>
  );
}
