import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@app/ui/components/button";
import { useTheme } from "@app/ui/components/theme-provider";
import { cn } from "@app/ui/lib/utils";

const THEME_OPTIONS = [
  {
    icon: SunIcon,
    label: "Light",
    value: "light",
  },
  {
    icon: MoonIcon,
    label: "Dark",
    value: "dark",
  },
  {
    icon: LaptopIcon,
    label: "System",
    value: "system",
  },
] as const;

export function ThemeToggleGroup() {
  const { isLoaded, setTheme, theme } = useTheme();

  return (
    <div className="space-y-2">
      <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">Theme</p>
      <div className="inline-flex items-center rounded-lg border border-border/60 bg-background/75 p-1 shadow-xs">
        {THEME_OPTIONS.map((option) => (
          <Button
            aria-label={option.label}
            aria-pressed={isLoaded && theme === option.value}
            className={cn(
              "h-8 rounded-md border px-2.5 transition-colors",
              isLoaded && theme === option.value
                ? "border-primary/70 bg-primary text-primary-foreground shadow-sm"
                : "border-transparent text-muted-foreground hover:border-border/70 hover:text-foreground",
            )}
            disabled={!isLoaded}
            key={option.value}
            onClick={() => setTheme(option.value)}
            size="sm"
            variant="ghost"
          >
            <option.icon
              className={cn(
                "size-4",
                isLoaded && theme === option.value && "drop-shadow-[0_0_6px_oklch(0.82_0.14_248)]",
              )}
            />
            <span
              className={cn(
                "hidden sm:inline",
                isLoaded && theme === option.value && "font-semibold",
              )}
            >
              {option.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
