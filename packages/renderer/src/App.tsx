import { useState } from "react";
import { Button } from "@app/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
    <main className="grid min-h-screen place-items-center px-6 py-10">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-center gap-6">
            <a href="https://vite.dev" rel="noreferrer" target="_blank">
              <img
                alt="Vite logo"
                className="h-14 w-14 transition hover:scale-110"
                src={viteLogo}
              />
            </a>
            <a href="https://react.dev" rel="noreferrer" target="_blank">
              <img
                alt="React logo"
                className="h-14 w-14 transition hover:scale-110"
                src={reactLogo}
              />
            </a>
          </div>
          <CardTitle className="text-balance text-4xl tracking-tight">
            Electron + Vite + React + shadcn/ui
          </CardTitle>
          <CardDescription>
            Production-ready baseline with shared UI primitives and system-aware theming.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3">
            <Label htmlFor="project-name">Project name</Label>
            <Input id="project-name" placeholder="electron-xyz" />
          </div>
          <Separator />
          <div className="flex flex-wrap items-center justify-center gap-3">
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
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Edit <code className="rounded bg-muted px-1 py-0.5">packages/renderer/src/App.tsx</code>{" "}
            to customize the template.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}

export default App;
