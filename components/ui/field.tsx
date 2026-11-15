import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type FieldProps = Omit<React.ComponentProps<"input">, "id"> & {
  label: string;
  /** Explain why the question is asked or how the answer is used. */
  hint?: string;
  /** What went wrong and how to fix it. Never vague, never apologetic. */
  error?: string;
  /** Adds an accessible show/hide control without changing the field styling. */
  showPasswordToggle?: boolean;
};

/** Label + input + hint + error, wired for screen readers. */
export function Field({
  label,
  hint,
  error,
  className,
  required,
  showPasswordToggle = false,
  type = "text",
  ...props
}: FieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const inputType = showPasswordToggle && type === "password" && visible ? "text" : type;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-caption font-semibold text-foreground">
        {label}
        {required ? <span className="text-muted"> (required)</span> : null}
      </label>
      <div className={showPasswordToggle ? "relative" : undefined}>
        <input
          id={id}
          type={inputType}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={cn(
            "h-12 w-full rounded-control border bg-surface px-4 text-body text-foreground placeholder:text-muted",
            showPasswordToggle && "pr-12",
            "transition-colors duration-150 focus-visible:outline-offset-0",
            error ? "border-danger" : "border-line hover:border-foreground/30",
          )}
          {...props}
        />
        {showPasswordToggle && type === "password" ? (
          <button
            type="button"
            className="absolute inset-y-0 right-3 inline-flex items-center justify-center text-muted hover:text-foreground"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? (
              <EyeOff className="size-5" aria-hidden />
            ) : (
              <Eye className="size-5" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
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
  );
}
