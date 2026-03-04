import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 py-10 text-slate-100">
      <section className="w-full max-w-3xl rounded-2xl border border-slate-700/70 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/60 backdrop-blur">
        <div className="mb-8 flex items-center justify-center gap-6">
          <a href="https://vite.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo} className="h-14 w-14 transition hover:scale-110" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img
              src={reactLogo}
              className="h-14 w-14 transition hover:scale-110"
              alt="React logo"
            />
          </a>
        </div>
        <div className="space-y-6 text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight">
            Electron + Vite + React + Tailwind
          </h1>
          <p className="text-slate-300">
            Production starter template with secure Electron defaults.
          </p>
          <div className="flex justify-center">
            <button
              className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-400"
              onClick={() => setCount((value) => value + 1)}
            >
              count is {count}
            </button>
          </div>
          <p className="text-sm text-slate-400">
            Edit{" "}
            <code className="rounded bg-slate-800 px-1 py-0.5">packages/renderer/src/App.tsx</code>{" "}
            to customize the template.
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
