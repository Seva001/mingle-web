"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useTheme } from "@/components/layout/theme-provider";
import type { ThemePreference } from "@/lib/theme";

const options = [
  { value: "light", label: "Light", icon: <Sun className="size-4" aria-hidden /> },
  { value: "dark", label: "Dark", icon: <Moon className="size-4" aria-hidden /> },
  { value: "system", label: "System", icon: <Monitor className="size-4" aria-hidden /> },
] as const satisfies readonly { value: ThemePreference; label: string; icon: React.ReactNode }[];

export function ThemeToggle({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { preference, setPreference } = useTheme();
  return (
    <SegmentedControl
      label="Appearance"
      options={options}
      value={preference}
      onValueChange={setPreference}
      iconOnly={compact}
      className={className}
    />
  );
}
