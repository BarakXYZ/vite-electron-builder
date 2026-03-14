import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { isThemeSource, type ThemeSource } from "./ThemeState.js";

type RawThemePreference = {
  readonly themeSource?: unknown;
};

function parseThemePreference(value: unknown): ThemeSource | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const { themeSource } = value as RawThemePreference;
  return isThemeSource(themeSource) ? themeSource : null;
}

export class ThemePreferenceStore {
  readonly #filePath: string;

  constructor(app: Electron.App) {
    this.#filePath = join(app.getPath("userData"), "app-preferences", "theme.json");
  }

  load(): ThemeSource | null {
    try {
      const state = JSON.parse(readFileSync(this.#filePath, "utf8")) as unknown;
      return parseThemePreference(state);
    } catch {
      return null;
    }
  }

  save(themeSource: ThemeSource): void {
    mkdirSync(dirname(this.#filePath), { recursive: true });
    writeFileSync(this.#filePath, `${JSON.stringify({ themeSource }, null, 2)}\n`, "utf8");
  }
}
