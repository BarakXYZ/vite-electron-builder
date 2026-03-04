# Renderer Package

This package is the default UI layer for the template:

- React 19
- Vite 7
- Tailwind CSS 4 (`@tailwindcss/vite`)

## Development

```sh
pnpm --filter @app/renderer dev
```

## Build

```sh
pnpm --filter @app/renderer build
```

Tailwind is configured through [`vite.config.ts`](./vite.config.ts) and shared UI styles from
[`../ui/src/styles/globals.css`](../ui/src/styles/globals.css).
The default setup uses shadcn/ui CSS variables and system-aware theming.
Shared shadcn/ui primitives are provided by [`../ui`](../ui).
