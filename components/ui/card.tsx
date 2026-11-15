import { cn } from "@/lib/utils";

type CardProps = React.ComponentProps<"div"> & { padded?: boolean };

/** Standard rounded surface. Use for panels, settings groups and form containers. */
export function Card({ padded = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface shadow-card",
        padded && "p-5 sm:p-6",
        className,
      )}
      {...props}
    />
  );
}
