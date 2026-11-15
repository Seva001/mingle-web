"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string; icon?: React.ReactNode };

type SegmentedControlProps<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onValueChange: (next: T) => void;
  /** Hide the visible text (kept for screen readers). For tight spaces like the header. */
  iconOnly?: boolean;
  className?: string;
};

/** Native radios underneath, so arrow-key navigation and screen-reader semantics come for free. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onValueChange,
  iconOnly = false,
  className,
}: SegmentedControlProps<T>) {
  const name = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex rounded-full border border-line bg-surface p-1", className)}
    >
      {options.map((option) => (
        <label key={option.value} className="relative cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onValueChange(option.value)}
            className="peer sr-only"
          />
          <span
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-full text-caption font-semibold text-muted transition-colors duration-150",
              iconOnly ? "px-3.5" : "px-4",
              "peer-checked:bg-foreground peer-checked:text-background hover:text-foreground peer-checked:hover:text-background",
              "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
            )}
          >
            {option.icon}
            <span className={iconOnly ? "sr-only" : undefined}>{option.label}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
