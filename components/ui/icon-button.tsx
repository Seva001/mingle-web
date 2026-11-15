import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "glass" | "photo" | "surface" | "ghost";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  glass: "glass text-foreground hover:brightness-110",
  /** For controls placed on top of a photo. */
  photo: "glass-photo hover:brightness-125",
  surface: "border border-line bg-surface text-foreground hover:bg-surface-raised",
  ghost: "text-foreground hover:bg-foreground/10",
};

function iconStyles(variant: Variant, size: Size, className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-full transition-[transform,filter,background-color] duration-150 ease-out active:scale-95 disabled:pointer-events-none disabled:opacity-50",
    size === "md" ? "size-11" : "size-14",
    variants[variant],
    className,
  );
}

type IconButtonProps = Omit<React.ComponentProps<"button">, "aria-label"> & {
  /** Required: icon-only controls must have an accessible name. */
  label: string;
  variant?: Variant;
  size?: Size;
};

export function IconButton({
  label,
  variant = "glass",
  size = "md",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={iconStyles(variant, size, className)}
      {...props}
    />
  );
}

type IconLinkProps = Omit<React.ComponentProps<typeof Link>, "aria-label"> & {
  label: string;
  variant?: Variant;
  size?: Size;
};

/** Same look as IconButton, but a real link for navigation. */
export function IconLink({
  label,
  variant = "glass",
  size = "md",
  className,
  ...props
}: IconLinkProps) {
  return (
    <Link
      aria-label={label}
      title={label}
      className={iconStyles(variant, size, className)}
      {...props}
    />
  );
}
