import { useState } from "react";
import { Button } from "@app/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@app/ui/components/dialog";
import { Input } from "@app/ui/components/input";
import { Label } from "@app/ui/components/label";
import { ModeToggle } from "@app/ui/components/mode-toggle";
import { Separator } from "@app/ui/components/separator";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="space-y-3">
          <div className="flex items-center gap-4">
            <a href="https://vite.dev" rel="noreferrer" target="_blank">
              <img
                alt="Vite logo"
                className="h-12 w-12 transition hover:scale-110"
                src={viteLogo}
              />
            </a>
            <a href="https://react.dev" rel="noreferrer" target="_blank">
              <img
                alt="React logo"
                className="h-12 w-12 transition hover:scale-110"
                src={reactLogo}
              />
            </a>
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight">
            Electron UI Starter
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Shared shadcn/ui primitives, strict linting, and system-aware theming ready for product
            work.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Starter Playground</CardTitle>
              <CardDescription>Validate core interactions and theming.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => setCount((value) => value + 1)}>count is {count}</Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary">Open dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>shadcn/ui infrastructure is ready</DialogTitle>
                      <DialogDescription>
                        Add new components with <code>pnpm shadcn:add button</code> from the root.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter showCloseButton />
                  </DialogContent>
                </Dialog>
                <ModeToggle />
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Edit{" "}
                <code className="rounded bg-muted px-1 py-0.5">packages/renderer/src/App.tsx</code>{" "}
                to customize the template.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Setup</CardTitle>
              <CardDescription>Baseline form primitives.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label htmlFor="project-name">Project name</Label>
              <Input id="project-name" placeholder="electron-xyz" />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Development</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <code>pnpm start</code> to run Electron in dev mode.
              </p>
              <p>
                <code>pnpm build</code> to compile all workspace packages.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">UI Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <code>pnpm shadcn:add &lt;component&gt;</code> to add shared primitives.
              </p>
              <p>Theme defaults to system and can be toggled at runtime.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default App;
