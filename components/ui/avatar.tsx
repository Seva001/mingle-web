import Image from "next/image";
import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  src?: string;
  size?: number;
  /** Orange ring for new connections. */
  highlighted?: boolean;
  className?: string;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, src, size = 64, highlighted = false, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-raised font-semibold text-muted",
        highlighted && "ring-2 ring-brand ring-offset-2 ring-offset-background",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {src ? (
        // Private-storage photos arrive as signed URLs in Phase 3, so skip the optimiser.
        <Image src={src} alt={name} fill sizes={`${size}px`} unoptimized className="object-cover" />
      ) : (
        <span aria-label={name} role="img">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
