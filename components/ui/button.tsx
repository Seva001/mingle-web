import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "glass" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-busy:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  // Dark text on orange: white on #FF6A1F is only 2.9:1, dark is 6.9:1.
  primary: "bg-brand text-on-brand hover:brightness-110",
  secondary: "border border-line bg-surface text-foreground hover:bg-surface-raised",
  glass: "glass text-foreground hover:brightness-110",
  ghost: "text-foreground hover:bg-foreground/10",
  danger: "bg-danger text-background hover:brightness-110",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-caption",
  md: "h-11 px-5 text-body",
  lg: "h-14 px-7 text-lead rounded-[1.25rem]",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks interaction. Announce the result in the UI that follows. */
  loading?: boolean;
};

export function Button({
  variant,
  size,
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonStyles({ variant, size, className })} {...props} />;
}
