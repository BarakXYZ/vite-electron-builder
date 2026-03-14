# Electron XYZ Monorepo Template

A production-ready Electron starter built for real monorepo growth.

It ships a future-friendly `apps/*` + `packages/*` topology, Turborepo task orchestration, and a modern desktop baseline with React, Tailwind CSS v4, shadcn/ui, TSGo, Oxlint, Oxfmt, and Playwright.

## What You Get

- `apps/desktop` as an explicit desktop app workspace.
- `packages/*` for reusable libraries, desktop internals, and tooling helpers.
- Turborepo-powered `build`, `lint`, and `typecheck` workflows.
- Electron with security-focused defaults and process-aware architecture.
- React + Vite + Tailwind CSS v4 renderer baseline.
- Shared shadcn/ui primitives in `packages/ui`.
- Electron-native theme handling backed by `nativeTheme.themeSource`.
- Detached DevTools with persisted geometry and focus-safe behavior.
- Playwright Electron coverage for `light`, `dark`, and `system` theme modes.
- Configurable E2E window behavior for `hidden`, `background`, and `interactive` runs.
- Electron Builder packaging wired for the monorepo layout.

## Requirements

- Node.js `>=24.0.0`
- `pnpm@10`

This repo currently pins Node `24.14.0` in [`.prototools`](./.prototools) and [`.node-version`](./.node-version). If you use Proto/Prototools, that version is selected automatically, and CI reads the same version through `actions/setup-node`.

## Quick Start

```sh
pnpm install
pnpm start
```

Common tasks:

```sh
pnpm dev
pnpm dev:app
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm compile
```

## Repo Topology

The workspace follows the Turborepo-recommended split between deployable apps and reusable packages.

```text
apps/
  desktop/
    buildResources/
    scripts/
    tests/
    types/
    electron-builder.mjs
    package.json
    playwright.config.ts

packages/
  desktop-main/
  desktop-preload/
  desktop-renderer/
  desktop-electron-versions/
  ui/
```

### Why This Shape

- `apps/*` contains product entrypoints and app-specific configuration.
- `packages/*` contains reusable or app-internal libraries with explicit ownership.
- Electron process boundaries stay clear inside the desktop app stack.
- Web and mobile apps can be added later without rethinking the repo root.

## Desktop Package Overview

- [`apps/desktop`](./apps/desktop) - desktop app workspace, packaging config, scripts, Playwright suite, app-specific types.
- [`packages/desktop-main`](./packages/desktop-main) - Electron main process orchestration, lifecycle, security, theme, windows, updates.
- [`packages/desktop-preload`](./packages/desktop-preload) - explicit `contextBridge` surface and browser-safe preload shim exports.
- [`packages/desktop-renderer`](./packages/desktop-renderer) - the React renderer app.
- [`packages/desktop-electron-versions`](./packages/desktop-electron-versions) - Electron/Chrome/Node version helpers used by desktop tooling.
- [`packages/ui`](./packages/ui) - shared shadcn/ui primitives, hooks, and styles.

## Task Model

Turborepo is the default task graph for scalable workspace tasks.

### Root Scripts

```sh
pnpm build
```

Runs `turbo run build` across packages that expose a `build` script.

```sh
pnpm lint
pnpm lint:type-aware
pnpm lint:typecheck
```

Runs Oxlint across all governed workspaces through Turbo.

```sh
pnpm typecheck
```

Runs TSGo type checking across workspaces that expose `typecheck`.

```sh
pnpm start
```

Starts an app-scoped desktop Electron development session that exits when the app closes.

```sh
pnpm dev
pnpm dev:app
```

- `pnpm dev` keeps the renderer server and main/preload watch tasks warm after the app window closes.
- `pnpm dev:app` starts the same desktop stack, but tears the session down when the Electron app exits.

```sh
pnpm test
pnpm test:background
pnpm test:hidden
pnpm test:interactive
```

Runs the desktop Playwright suite using the configured E2E window mode.

```sh
pnpm compile
```

Packages the desktop app with Electron Builder.

```sh
pnpm fmt
pnpm fmt:check
```

Formats or checks the repository with Oxfmt.

## Turbo Integration

Turbo is the default workspace task graph for this repository.

Today it governs:

- `build`
- `compile`
- `dev`
- `lint`
- `lint:type-aware`
- `lint:typecheck`
- `test`
- `test:background`
- `test:hidden`
- `test:interactive`
- `typecheck`

Shared defaults live in [`turbo.json`](./turbo.json).

Package-specific task policy lives next to the package when behavior is app-specific:

- [`apps/desktop/turbo.json`](./apps/desktop/turbo.json) for desktop-only `build` / `compile` / `dev` / `test*`
- [`packages/desktop-main/turbo.json`](./packages/desktop-main/turbo.json) for desktop-main build env hashing and dev watch policy
- [`packages/desktop-preload/turbo.json`](./packages/desktop-preload/turbo.json) for preload dev watch policy
- [`packages/desktop-renderer/turbo.json`](./packages/desktop-renderer/turbo.json) for renderer build outputs and dev-server policy

That gives the repo:

- package-graph task ordering
- local caching for deterministic build and analysis tasks
- non-cached persistent handling for long-running desktop development
- non-cached orchestration for Electron packaging and Playwright E2E flows
- affected-only execution in CI when Turbo has an SCM base to compare against
- a clean path to remote caching in CI via `TURBO_TEAM` and `TURBO_TOKEN`
- a stable foundation for future `apps/web` and `apps/mobile`

The desktop development flow now follows the same graph-aware model:

- `@app/desktop-renderer#dev` runs the Vite renderer server and publishes its resolved URL to the app workspace
- `@app/desktop-main#dev` and `@app/desktop-preload#dev` run watch builds
- `@app/desktop#dev` owns only the Electron runtime process and composes the companion tasks with Turbo `with`
- persistent dev tasks are marked `interruptible` so the repo is ready for `turbo watch`-style restartable workflows

The app-scoped convenience session intentionally sits outside the Turbo graph:

- `pnpm dev:app` starts the renderer/main/preload package scripts directly and shuts them down when Electron exits
- `pnpm start` aliases that same app-scoped session

### Remote Cache Onboarding

This repository is already wired to use Turbo Remote Caching in GitHub Actions when the required repository configuration is present.

#### GitHub Actions configuration

Set these in the GitHub repository before expecting CI cache hits:

1. Repository variable: `TURBO_TEAM`
2. Repository secret: `TURBO_TOKEN`

The CI workflows read them here:

- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)
- [`.github/workflows/compile-and-test.yml`](./.github/workflows/compile-and-test.yml)
- [`.github/workflows/main.yml`](./.github/workflows/main.yml)

If they are not configured, CI still works, but Turbo falls back to local-only caching for that run.

#### Local developer setup

Authenticate the Turbo CLI with your remote cache provider:

```sh
pnpm dlx turbo login
```

If your cache provider requires single sign-on, use:

```sh
pnpm dlx turbo login --sso-team <team-slug>
```

Then link this repository to the remote cache:

```sh
pnpm dlx turbo link
```

If you use a self-hosted remote cache instead of the managed Vercel cache, use:

```sh
pnpm dlx turbo login --manual
```

#### Verifying remote cache behavior

Run a cacheable task once:

```sh
pnpm build
```

Then clear the local Turbo cache:

```sh
rm -rf ./.turbo/cache
```

Run the same task again:

```sh
pnpm build
```

If remote caching is configured correctly, Turbo should replay cached logs and artifacts instead of rebuilding locally.

#### Artifact signing

Turbo also supports signing remote cache artifacts with `TURBO_REMOTE_CACHE_SIGNATURE_KEY` and `remoteCache.signature`.

This repository does not enable signed remote-cache artifacts by default yet, because enabling signatures should be done only when all local and CI environments are ready to provide the signing key consistently.

#### Cache-safety notes

Remote caching is only safe when task inputs are declared correctly.

This repository already accounts for the main non-default task inputs used by the desktop app:

- `VITE_DISTRIBUTION_CHANNEL` is hashed for `build` and `compile`
- `APP_E2E_WINDOW_MODE` is declared for the E2E tasks
- `pnpm-lock.yaml` and `pnpm-workspace.yaml` are included in the global hash via `globalDependencies`
- package lint tasks hash the shared root Oxlint configs explicitly

Those settings live in [`turbo.json`](./turbo.json).

## Desktop Architecture

Inside the desktop process packages, code is organized as:

```text
src/
  app/        # bootstrap, composition, entry wiring
  features/   # vertical slices by capability
```

This keeps Electron's process model intact while avoiding a flat `modules/` bucket.

### Main Process

Relevant code lives in [`packages/desktop-main/src`](./packages/desktop-main/src).

Current slices include:

- lifecycle
- platform
- security
- testing presentation policies
- theme
- updates
- windows

### Preload Surface

The preload bridge lives in [`packages/desktop-preload/src`](./packages/desktop-preload/src).

The renderer consumes a single explicit bridge:

```ts
window.electronAPI;
```

Example capabilities:

- `window.electronAPI.versions`
- `window.electronAPI.sha256sum()`
- `window.electronAPI.theme.getState()`
- `window.electronAPI.theme.setThemeSource()`
- `window.electronAPI.theme.subscribe()`

This follows Electron's guidance to expose narrow preload APIs instead of generic IPC passthrough.

### Renderer

The default desktop UI lives in [`packages/desktop-renderer`](./packages/desktop-renderer).

It ships with:

- React
- Vite
- Tailwind CSS v4
- shared shadcn/ui primitives from `packages/ui`
- feature-sliced renderer code under `src/features`

## UI Workflow

The shared design system lives in [`packages/ui`](./packages/ui).

### shadcn/ui in a Monorepo

This repo intentionally separates app-specific blocks from shared primitives.

Add app-specific blocks/components to the desktop renderer:

```sh
pnpm shadcn:add:app sidebar-01
```

Add shared primitives to the UI package:

```sh
pnpm shadcn:add:ui button
```

Configuration lives in:

- [`packages/desktop-renderer/components.json`](./packages/desktop-renderer/components.json)
- [`packages/ui/components.json`](./packages/ui/components.json)

## Theme System

Theme is implemented as a real Electron feature rather than a renderer-local toggle.

### Source of Truth

The source of truth is Electron's [`nativeTheme.themeSource`](https://www.electronjs.org/docs/latest/api/native-theme):

- `light`
- `dark`
- `system`

The main process owns theme state, persists user preference, and broadcasts updates to renderer windows.

Relevant code:

- [`packages/desktop-main/src/features/theme`](./packages/desktop-main/src/features/theme)
- [`packages/desktop-preload/src/features/theme/theme.ts`](./packages/desktop-preload/src/features/theme/theme.ts)
- [`packages/desktop-renderer/src/features/theme/electronThemeController.ts`](./packages/desktop-renderer/src/features/theme/electronThemeController.ts)
- [`packages/ui/src/components/theme-provider.tsx`](./packages/ui/src/components/theme-provider.tsx)

### Startup Flash Prevention

The desktop template also handles early theme paint correctly:

- native `BrowserWindow.backgroundColor` is set from the resolved theme
- the renderer document seeds its initial background before React mounts
- runtime theme sync happens through the normal provider/controller path

## Testing

The Playwright suite lives in [`apps/desktop/tests`](./apps/desktop/tests) and runs against the real Electron app.

Current project matrix:

- `electron-light`
- `electron-dark`
- `electron-system`

The suite is organized by responsibility:

```text
apps/desktop/tests/
  e2e/
    app-shell.spec.ts
    preload-api.spec.ts
    theme.spec.ts
    window.spec.ts
  fixtures/
    electron.ts
  helpers/
    mainWindow.ts
    theme.ts
  support/
    electronAppProfile.ts
    e2eRuntimeConfig.ts
```

### E2E Window Modes

Desktop E2E behavior is controlled in:

- [`apps/desktop/tests/e2e.runtime.config.ts`](./apps/desktop/tests/e2e.runtime.config.ts)

Available modes:

- `hidden` - keep the app off-screen while tests run
- `background` - show the app without stealing OS focus
- `interactive` - show and focus the app normally for debugging

Examples:

```sh
pnpm test -- --project electron-dark
pnpm test:background -- --project electron-dark
pnpm test:interactive -- --project electron-dark
```

Playwright configuration lives in [`apps/desktop/playwright.config.ts`](./apps/desktop/playwright.config.ts).

## Security Defaults

The template keeps Electron security as a first-class concern.

Current defaults include:

- `contextIsolation: true`
- `nodeIntegration: false`
- permission requests denied by default
- explicit preload bridge instead of generic IPC passthrough
- renderer CSP in the desktop HTML entrypoint
- constrained external URL handling in main

Relevant code:

- [`packages/desktop-main/src/features/security`](./packages/desktop-main/src/features/security)
- [`packages/desktop-preload/src/app/exposeElectronApi.ts`](./packages/desktop-preload/src/app/exposeElectronApi.ts)

> [!NOTE]
> The default `BrowserWindow` still uses `sandbox: false` because the starter preload depends on Node-capable APIs. If you remove that dependency, enabling sandboxing is the next recommended hardening step.

## DevTools Behavior

The desktop template includes a detached DevTools implementation that avoids the common focus and persistence issues.

It currently:

- opens DevTools in a separate window
- persists size, position, and maximized state
- restores safely across display changes
- avoids stealing focus from the app window on open

Relevant code:

- [`packages/desktop-main/src/features/windows/devtools`](./packages/desktop-main/src/features/windows/devtools)

## Packaging

Desktop packaging uses [`electron-builder`](https://www.electron.build/) from the app workspace.

```sh
pnpm compile
```

Configuration lives in [`apps/desktop/electron-builder.mjs`](./apps/desktop/electron-builder.mjs).

Build resources live in [`apps/desktop/buildResources`](./apps/desktop/buildResources).

## References

- [Turborepo getting started](https://turborepo.com/docs/getting-started)
- [Turborepo running tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Turborepo caching](https://turborepo.com/docs/core-concepts/caching)
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
