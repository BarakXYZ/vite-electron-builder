export const THEME_SOURCES = ["light", "dark", "system"] as const;

export type ThemeSource = (typeof THEME_SOURCES)[number];
export type ResolvedTheme = Exclude<ThemeSource, "system">;

export type ThemeState = {
  readonly resolvedTheme: ResolvedTheme;
  readonly themeSource: ThemeSource;
};

export function isThemeSource(value: unknown): value is ThemeSource {
  return typeof value === "string" && THEME_SOURCES.includes(value as ThemeSource);
}
