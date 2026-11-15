import { useId } from "react";
import { cn } from "@/lib/utils";

type TextareaFieldProps = Omit<React.ComponentProps<"textarea">, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  /** Shows "12 / 500" so members see the limit before hitting it. */
  count?: { current: number; max: number };
};

export function TextareaField({
  label,
  hint,
  error,
  count,
  className,
  required,
  ...props
}: TextareaFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-caption font-semibold text-foreground">
        {label}
        {required ? <span className="text-muted"> (required)</span> : null}
      </label>
      <textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={cn(
          "min-h-32 rounded-control border bg-surface px-4 py-3 text-body text-foreground placeholder:text-muted",
          "transition-colors duration-150 focus-visible:outline-offset-0",
          error ? "border-danger" : "border-line hover:border-foreground/30",
        )}
        {...props}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          {hint && !error ? (
            <p id={hintId} className="text-caption text-muted">
              {hint}
            </p>
          ) : null}
          {error ? (
            <p id={errorId} className="text-caption font-medium text-danger">
              {error}
            </p>
          ) : null}
        </div>
        {count ? (
          <p className="shrink-0 text-caption text-muted" aria-live="off">
            {count.current} / {count.max}
          </p>
        ) : null}
      </div>
    </div>
  );
}
