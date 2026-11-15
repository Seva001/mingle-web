"use client";

import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  /** Accessible name, e.g. "Weekly activity summary". */
  label: string;
  disabled?: boolean;
  className?: string;
};

export function Switch({ checked, onCheckedChange, label, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-150 disabled:opacity-50",
        checked ? "border-foreground bg-foreground" : "border-line bg-surface-raised",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block size-5 rounded-full transition-transform duration-200 ease-out",
          checked ? "translate-x-[1.5rem] bg-background" : "translate-x-[0.25rem] bg-muted",
        )}
      />
    </button>
  );
}
