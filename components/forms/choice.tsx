"use client";

import { Check } from "lucide-react";
import { useId } from "react";
import { Chip } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string };

function describedBy(...ids: (string | false | undefined)[]) {
  return ids.filter(Boolean).join(" ") || undefined;
}

type SingleChoiceProps<T extends string> = {
  legend: string;
  hint?: string;
  options: readonly Option<T>[];
  value: T | null;
  onChange: (next: T) => void;
  error?: string;
  /** Use one column for long labels. */
  columns?: 1 | 2;
};

/** One answer from a few. Native radios underneath: arrow keys and screen readers just work. */
export function SingleChoice<T extends string>({
  legend,
  hint,
  options,
  value,
  onChange,
  error,
  columns = 2,
}: SingleChoiceProps<T>) {
  const name = useId();
  return (
    <fieldset
      aria-describedby={describedBy(hint && `${name}-hint`, error && `${name}-error`)}
      className="flex min-w-0 flex-col gap-2"
    >
      <legend className="mb-1 text-caption font-semibold text-foreground">{legend}</legend>
      {hint ? (
        <p id={`${name}-hint`} className="-mt-1 mb-1 text-caption text-muted">
          {hint}
        </p>
      ) : null}
      <div className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2")}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label key={option.value} className="relative block cursor-pointer">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-control border px-4 py-3 text-body transition-colors duration-150",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
                  selected
                    ? "border-foreground bg-surface-raised font-semibold"
                    : "border-line bg-surface hover:bg-surface-raised",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-foreground bg-foreground text-background" : "border-line",
                  )}
                >
                  {selected ? <Check className="size-3" strokeWidth={3} /> : null}
                </span>
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={`${name}-error`} className="text-caption font-medium text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

type MultiChoiceProps<T extends string> = {
  legend: string;
  hint?: string;
  options: readonly Option<T>[];
  value: readonly T[];
  onChange: (next: T[]) => void;
  max?: number;
  error?: string;
};

/** Several answers from a list, with an optional cap. Selected chips show a check mark. */
export function MultiChoice<T extends string>({
  legend,
  hint,
  options,
  value,
  onChange,
  max,
  error,
}: MultiChoiceProps<T>) {
  const id = useId();
  const atMax = max !== undefined && value.length >= max;
  return (
    <fieldset
      aria-describedby={describedBy(hint && `${id}-hint`, error && `${id}-error`)}
      className="flex min-w-0 flex-col gap-2"
    >
      <legend className="mb-1 text-caption font-semibold text-foreground">{legend}</legend>
      {hint ? (
        <p id={`${id}-hint`} className="-mt-1 mb-1 text-caption text-muted">
          {hint}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option.value);
          return (
            <Chip
              key={option.value}
              selected={selected}
              disabled={!selected && atMax}
              className="disabled:opacity-40"
              onSelectedChange={(next) =>
                onChange(next ? [...value, option.value] : value.filter((v) => v !== option.value))
              }
            >
              {option.label}
            </Chip>
          );
        })}
      </div>
      {max !== undefined ? (
        <p className="text-caption text-muted" aria-live="polite">
          {value.length} of {max} selected
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-caption font-medium text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
