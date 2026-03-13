import { useState } from "react";
import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@app/ui/components/button";
import { useTheme } from "@app/ui/components/theme-provider";
import { cn } from "@app/ui/lib/utils";

function App() {
  const [count, setCount] = useState(0);
  const { setTheme, theme } = useTheme();

  const themeOptions = [
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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.78_0.11_183_/_0.22),transparent_38%),radial-gradient(circle_at_80%_80%,oklch(0.71_0.2_325_/_0.18),transparent_44%)]" />

      <section className="relative w-full max-w-3xl space-y-8 rounded-2xl border border-border/50 bg-card/30 p-8 shadow-2xl backdrop-blur-sm">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
              Electron XYZ
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-teal-400 sm:text-6xl">
              Hi there!
            </h1>
            <p className="flex items-center gap-2 text-lg text-muted-foreground">
              <span className="text-fuchsia-300">{">_"}</span>
              It&apos;s time to build something awesome.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">Theme</p>
            <div className="inline-flex items-center rounded-lg border border-border/60 bg-background/75 p-1 shadow-xs">
              {themeOptions.map((option) => (
                <Button
                  aria-label={option.label}
                  aria-pressed={theme === option.value}
                  className={cn(
                    "h-8 rounded-md border px-2.5 transition-colors",
                    theme === option.value
                      ? "border-primary/70 bg-primary text-primary-foreground shadow-sm"
                      : "border-transparent text-muted-foreground hover:border-border/70 hover:text-foreground",
                  )}
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  size="sm"
                  variant="ghost"
                >
                  <option.icon
                    className={cn(
                      "size-4",
                      theme === option.value && "drop-shadow-[0_0_6px_oklch(0.82_0.14_248)]",
                    )}
                  />
                  <span
                    className={cn("hidden sm:inline", theme === option.value && "font-semibold")}
                  >
                    {option.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </header>

        <div className="space-y-3">
          <h2 className="text-base font-medium text-foreground">Electron Workspace</h2>
          <p className="text-sm text-muted-foreground">
            Vite + React + shadcn/ui baseline with strict checks and production-focused defaults.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="h-11 rounded-full border-fuchsia-300/40 bg-gradient-to-r from-fuchsia-500 to-violet-500 px-5 text-white shadow-[0_10px_30px_-12px_oklch(0.57_0.25_325)] transition-all hover:brightness-110"
            onClick={() => setCount((value) => value + 1)}
            variant="ghost"
          >
            count is {count}
          </Button>
          <Button asChild variant="secondary">
            <a href="https://ui.shadcn.com/blocks" rel="noreferrer" target="_blank">
              Browse shadcn blocks
            </a>
          </Button>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p>
            <code>pnpm start</code>
          </p>
          <p>
            <code>pnpm build</code>
          </p>
          <p>
            <code>pnpm lint:typecheck</code>
          </p>
          <p>
            <code>pnpm typecheck</code>
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
