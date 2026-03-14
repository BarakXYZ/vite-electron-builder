import { ipcRenderer } from "electron";

const GET_THEME_STATE_CHANNEL = "theme:get-state";
const SET_THEME_SOURCE_CHANNEL = "theme:set-source";
const THEME_CHANGED_CHANNEL = "theme:changed";

const THEME_SOURCES = ["light", "dark", "system"] as const;

type ThemeSource = (typeof THEME_SOURCES)[number];
type ResolvedTheme = Exclude<ThemeSource, "system">;

type ThemeState = {
  readonly resolvedTheme: ResolvedTheme;
  readonly themeSource: ThemeSource;
};

function isThemeSource(value: unknown): value is ThemeSource {
  return typeof value === "string" && THEME_SOURCES.includes(value as ThemeSource);
}

function isThemeState(value: unknown): value is ThemeState {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const { resolvedTheme, themeSource } = value as Record<string, unknown>;

  return (resolvedTheme === "dark" || resolvedTheme === "light") && isThemeSource(themeSource);
}

function assertThemeState(value: unknown): ThemeState {
  if (!isThemeState(value)) {
    throw new TypeError("Invalid theme state");
  }

  return value;
}

const theme = Object.freeze({
  async getState(): Promise<ThemeState> {
    return assertThemeState(await ipcRenderer.invoke(GET_THEME_STATE_CHANNEL));
  },
  async setThemeSource(themeSource: ThemeSource): Promise<ThemeState> {
    return assertThemeState(await ipcRenderer.invoke(SET_THEME_SOURCE_CHANNEL, themeSource));
  },
  subscribe(listener: (state: ThemeState) => void): () => void {
    const handler = (_event: Electron.IpcRendererEvent, nextState: unknown) => {
      listener(assertThemeState(nextState));
    };

    ipcRenderer.on(THEME_CHANGED_CHANNEL, handler);

    return () => {
      ipcRenderer.removeListener(THEME_CHANGED_CHANNEL, handler);
    };
  },
});

export { theme, THEME_SOURCES };
export type { ResolvedTheme, ThemeSource, ThemeState };
