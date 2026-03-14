import type { Page } from "@playwright/test";
import type { ThemeState } from "@app/desktop-preload";

export const RESOLVED_THEME_BACKGROUNDS = {
  dark: {
    document: "rgb(10, 10, 10)",
    nativeWindow: "#0A0A0A",
  },
  light: {
    document: "rgb(255, 255, 255)",
    nativeWindow: "#FFFFFF",
  },
} as const;

export async function getThemeSnapshot(page: Page): Promise<{
  documentBackgroundColor: string;
  documentClassName: string;
  mediaPrefersDark: boolean;
  mediaPrefersLight: boolean;
  state: ThemeState;
}> {
  return page.evaluate(async () => {
    const state = await window.electronAPI.theme.getState();

    return {
      documentBackgroundColor: window.getComputedStyle(document.documentElement).backgroundColor,
      documentClassName: document.documentElement.className,
      mediaPrefersDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
      mediaPrefersLight: window.matchMedia("(prefers-color-scheme: light)").matches,
      state,
    };
  });
}
