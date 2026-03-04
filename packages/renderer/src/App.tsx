import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="grid min-h-screen place-items-center bg-app-canvas px-6 py-10 text-app-text-primary">
      <section className="w-full max-w-3xl rounded-2xl border border-app-border bg-app-surface p-8 shadow-app-elevated backdrop-blur">
        <div className="mb-8 flex items-center justify-center gap-6">
          <a href="https://vite.dev" rel="noreferrer" target="_blank">
            <img alt="Vite logo" className="h-14 w-14 transition hover:scale-110" src={viteLogo} />
          </a>
          <a href="https://react.dev" rel="noreferrer" target="_blank">
            <img
              alt="React logo"
              className="h-14 w-14 transition hover:scale-110"
              src={reactLogo}
            />
          </a>
        </div>
        <div className="space-y-6 text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight">
            Electron + Vite + React + Tailwind
          </h1>
          <p className="text-app-text-secondary">
            Production starter template with secure Electron defaults.
          </p>
          <div className="flex justify-center">
            <button
              className="rounded-lg bg-app-brand px-4 py-2 font-medium text-app-brand-contrast transition hover:bg-app-brand-hover"
              onClick={() => setCount((value) => value + 1)}
            >
              count is {count}
            </button>
          </div>
          <p className="text-sm text-app-text-muted">
            Edit{" "}
            <code className="rounded bg-app-code-bg px-1 py-0.5">
              packages/renderer/src/App.tsx
            </code>{" "}
            to customize the template.
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
