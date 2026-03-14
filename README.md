> [!Important]
> This project is maintained by a developer from Ukraine 🇺🇦
>
> If this template has been useful to you, please consider [supporting Ukraine](https://stand-with-ukraine.pp.ua/) or [supporting the original author](https://send.monobank.ua/6SmojkkR9i).

![IMG_0875](https://github.com/user-attachments/assets/590de304-e2c4-4935-9814-c18ade52fd8e)

# Vite Electron Builder Boilerplate

A production-ready Electron starter built on a workspace monorepo, Vite, React, Tailwind CSS v4, shadcn/ui, TSGo, Oxlint, Oxfmt, and Playwright.

This fork keeps the original template's secure Electron foundation and upgrades the stack around it with stricter tooling, stronger UI primitives, explicit theme infrastructure, and cleaner process-oriented architecture.

## What You Get

- Electron with security-focused defaults and a process-first architecture.
- A workspace monorepo using `pnpm` workspaces.
- A default renderer built with Vite + React + Tailwind CSS v4.
- Shared shadcn/ui primitives in a dedicated `packages/ui` package.
- Electron-native theme handling backed by `nativeTheme.themeSource`.
- Detached DevTools window management with persisted geometry.
- Fast TypeScript checks with TSGo.
- Linting with Oxlint and formatting with Oxfmt.
- Playwright end-to-end coverage for `light`, `dark`, and `system` theme modes.
- `electron-builder` packaging and release-friendly defaults.

## Requirements

- Node.js `>=24.0.0`
- `pnpm@10`

This repo currently pins Node `24.14.0` in [`.prototools`](./.prototools). If you use Proto/Prototools, it will pick that version automatically.

## Quick Start

```sh
pnpm install
pnpm start
```

Build all workspaces:

```sh
pnpm build
```

Run end-to-end tests:

```sh
pnpm test
```

Build a distributable app with `electron-builder`:

```sh
pnpm compile
```

## Stack

### Runtime

- [Electron](https://www.electronjs.org/)
- [Vite](https://vite.dev/)
- [React](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/docs/installation/using-vite)
- [shadcn/ui](https://ui.shadcn.com/docs/installation/vite)

### Tooling

- [pnpm workspaces](https://pnpm.io/workspaces)
- [Playwright](https://playwright.dev/docs/api/class-electron)
- [Oxlint](https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint)
- [Oxfmt](https://oxc.rs/docs/guide/usage/formatter/migrate-from-prettier)
- [`@typescript/native-preview` (TSGo)](https://www.npmjs.com/package/@typescript/native-preview)

## Architecture

This repo is organized around Electron process boundaries first, then feature boundaries inside each package.

```text
packages/
  main/       # Electron main process
  preload/    # Electron preload bridge
  renderer/   # Vite + React application
  ui/         # Shared shadcn/ui components, hooks, styles
```

Inside the app-facing packages, the code follows this pattern:

```text
src/
  app/        # bootstrap, composition, entry wiring
  features/   # vertical feature slices
```

That gives us a structure that matches Electron's official process model while staying scalable as features grow.

### Package Overview

- [`packages/main`](./packages/main) - main-process orchestration, windows, theme state, security rules, updates, lifecycle.
- [`packages/preload`](./packages/preload) - explicit `contextBridge` surface exposed to the renderer.
- [`packages/renderer`](./packages/renderer) - the default desktop UI built with React.
- [`packages/ui`](./packages/ui) - shared design-system package for shadcn/ui primitives and styles.
- [`packages/electron-versions`](./packages/electron-versions) - Electron version helpers used by build config.
- [`packages/integrate-renderer`](./packages/integrate-renderer) - helper package used when bootstrapping/replacing a renderer package.

## Development Workflow

Start the dev environment:

```sh
pnpm start
```

This runs the Electron dev flow with hot reload.

### Key Scripts

```sh
pnpm start
```

Run Electron in development mode.

```sh
pnpm build
```

Build every workspace that exposes a `build` script.

```sh
pnpm test
```

Build the app and run Playwright Electron end-to-end tests.

```sh
pnpm compile
```

Build the app and package it with `electron-builder`.

```sh
pnpm fmt
pnpm fmt:check
```

Format or verify formatting with Oxfmt.

```sh
pnpm lint
pnpm lint:type-aware
pnpm lint:typecheck
```

Run Oxlint across:

- `packages/main`
- `packages/preload`
- `packages/renderer`
- `packages/ui`
- `tests`

`lint:type-aware` enables TypeScript-aware rules.

`lint:typecheck` adds TypeScript diagnostics on top of type-aware linting.

```sh
pnpm typecheck
```

Run TSGo type checking in all workspaces that expose `typecheck`.

## UI Workflow

The default renderer already includes:

- React
- Tailwind CSS v4
- shadcn/ui
- a shared `packages/ui` package for reusable primitives

### shadcn/ui in a Monorepo

This repo intentionally separates app-level blocks from shared primitives.

Add app-specific blocks/components to the renderer:

```sh
pnpm shadcn:add:app sidebar-01
```

Add shared primitives to the UI package:

```sh
pnpm shadcn:add:ui button
```

Configuration lives in:

- [`packages/renderer/components.json`](./packages/renderer/components.json)
- [`packages/ui/components.json`](./packages/ui/components.json)

The setup follows the official Vite, monorepo, and dark-mode guidance from shadcn/ui.

## Theme System

Theme is handled as an Electron feature, not as an ad hoc renderer toggle.

### Source of Truth

The source of truth is Electron's [`nativeTheme.themeSource`](https://www.electronjs.org/docs/latest/api/native-theme):

- `light`
- `dark`
- `system`

The main process owns theme state, persists the user's preference, and broadcasts changes to renderer windows.

Relevant code:

- [`packages/main/src/features/theme`](./packages/main/src/features/theme)
- [`packages/preload/src/features/theme/theme.ts`](./packages/preload/src/features/theme/theme.ts)
- [`packages/renderer/src/features/theme/electronThemeController.ts`](./packages/renderer/src/features/theme/electronThemeController.ts)
- [`packages/ui/src/components/theme-provider.tsx`](./packages/ui/src/components/theme-provider.tsx)

### Why This Pattern

This matches Electron's official guidance better than relying only on `localStorage` and `matchMedia()` in the renderer:

- main process owns native app theme state
- preload exposes a narrow API surface
- renderer consumes an explicit theme controller
- tests can validate explicit and system theme behavior consistently

## Testing

Playwright tests live in [`tests`](./tests) and run against the compiled Electron app.

Current project matrix:

- `electron-light`
- `electron-dark`
- `electron-system`

That means the suite verifies:

- explicit light override behavior
- explicit dark override behavior
- true system-mode behavior
- renderer/media/theme-state consistency

Run all projects:

```sh
pnpm test
```

Run a single project:

```sh
pnpm exec playwright test --project electron-dark
```

Playwright configuration lives in [`playwright.config.js`](./playwright.config.js).

## Main / Preload / Renderer Contract

This repo favors a narrow, explicit preload bridge in line with Electron's security guidance.

The exposed bridge is available as:

```ts
window.electronAPI;
```

Example capabilities currently include:

- `window.electronAPI.versions`
- `window.electronAPI.sha256sum()`
- `window.electronAPI.theme.getState()`
- `window.electronAPI.theme.setThemeSource()`
- `window.electronAPI.theme.subscribe()`

For simple exported preload functions, the repo also generates a renderer-safe browser shim so explicit exports can still be consumed from `@app/preload` where appropriate.

### Example

```ts
const themeState = await window.electronAPI.theme.getState();

await window.electronAPI.theme.setThemeSource("dark");
```

If you need new native capabilities:

1. add a main-process feature or IPC handler
2. expose a narrow preload method
3. consume it from the renderer
4. add Playwright coverage when the capability affects behavior

## Security Defaults

This template keeps Electron security as a first-class concern.

Current defaults include:

- `contextIsolation: true`
- `nodeIntegration: false`
- permission requests denied by default
- external URL handling constrained in main
- renderer CSP in `index.html`
- explicit preload bridge instead of generic IPC passthrough

Relevant code:

- [`packages/main/src/features/security`](./packages/main/src/features/security)
- [`packages/preload/src/app/exposeElectronApi.ts`](./packages/preload/src/app/exposeElectronApi.ts)

> [!NOTE]
> The default `BrowserWindow` still uses `sandbox: false` because the starter preload currently depends on Node-capable APIs. If you remove that dependency, enabling sandboxing is the next recommended hardening step according to Electron's security guidance.

## DevTools Behavior

The dev template includes a detached DevTools implementation that avoids the common focus and persistence problems.

It currently:

- opens DevTools in a separate window
- persists size, position, and maximized state
- restores safely across display changes
- avoids stealing focus from the app window on open

Relevant code:

- [`packages/main/src/features/windows/devtools`](./packages/main/src/features/windows/devtools)

## Packaging and Distribution

This repo uses [`electron-builder`](https://www.electron.build/) for packaging.

Build a distributable app:

```sh
pnpm compile
```

Build unpacked output for inspection/debugging:

```sh
pnpm compile -- --dir -c.asar=false
```

The builder configuration lives in [`electron-builder.mjs`](./electron-builder.mjs).

## Replacing the Renderer

If you want to replace the bundled renderer package entirely:

```sh
pnpm run init
```

This uses the helper scripts in [`packages/integrate-renderer`](./packages/integrate-renderer).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## References

- [Electron process model](https://www.electronjs.org/docs/latest/tutorial/process-model)
- [Electron security tutorial](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron context isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Electron IPC tutorial](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Electron nativeTheme](https://www.electronjs.org/docs/latest/api/native-theme)
- [Playwright Electron](https://playwright.dev/docs/api/class-electron)
- [Playwright projects](https://playwright.dev/docs/test-projects)
- [Playwright color scheme emulation](https://playwright.dev/docs/emulation#color-scheme-and-media)
- [Tailwind CSS with Vite](https://tailwindcss.com/docs/installation/using-vite)
- [shadcn/ui Vite install](https://ui.shadcn.com/docs/installation/vite)
- [shadcn/ui monorepo](https://ui.shadcn.com/docs/monorepo)
- [shadcn/ui dark mode for Vite](https://ui.shadcn.com/docs/dark-mode/vite)
- [pnpm workspaces](https://pnpm.io/workspaces)
