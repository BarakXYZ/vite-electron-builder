import { useState } from "react";

import { Button } from "@app/ui/components/button";

import { ThemeToggleGroup } from "./components/ThemeToggleGroup.js";

const COMMANDS = ["pnpm start", "pnpm build", "pnpm lint:typecheck", "pnpm typecheck"] as const;

export function WorkspaceHomeScreen() {
  const [count, setCount] = useState(0);

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
          <ThemeToggleGroup />
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
          {COMMANDS.map((command) => (
            <p key={command}>
              <code>{command}</code>
            </p>
          ))}
        </div>
      </section>
    </main>
  );
}
