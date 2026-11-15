import { cn } from "@/lib/utils";

/** Form-level message. Errors interrupt (role="alert"); information is polite. */
export function FormNotice({
  tone = "error",
  children,
}: {
  tone?: "error" | "info";
  children: React.ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-control border p-4 text-caption font-medium",
        tone === "error"
          ? "border-danger text-danger"
          : "border-line bg-surface-raised text-foreground",
      )}
    >
      {children}
    </p>
  );
}
