import type { ResolvedTheme } from "./ThemeState.js";

const NATIVE_BACKGROUND_COLORS = {
  dark: "#0a0a0a",
  light: "#ffffff",
} as const satisfies Record<ResolvedTheme, string>;

export function getNativeBackgroundColor(resolvedTheme: ResolvedTheme): string {
  return NATIVE_BACKGROUND_COLORS[resolvedTheme];
}
