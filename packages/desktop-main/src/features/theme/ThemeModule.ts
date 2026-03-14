import { BrowserWindow, ipcMain, nativeTheme } from "electron";
import type { AppModule } from "../../app/AppModule.js";
import type { ModuleContext } from "../../app/ModuleContext.js";
import { ThemePreferenceStore } from "./ThemePreferenceStore.js";
import { ThemeService } from "./ThemeService.js";
import { isThemeSource } from "./ThemeState.js";

const GET_THEME_STATE_CHANNEL = "theme:get-state";
const SET_THEME_SOURCE_CHANNEL = "theme:set-source";
const THEME_CHANGED_CHANNEL = "theme:changed";

function broadcastThemeState(state: Awaited<ReturnType<ThemeService["getState"]>>): void {
  for (const window of BrowserWindow.getAllWindows()) {
    const { webContents } = window;
    if (webContents.isDestroyed()) {
      continue;
    }

    webContents.send(THEME_CHANGED_CHANNEL, state);
  }
}

class ThemeModule implements AppModule {
  readonly #environment;

  constructor({
    environment = process.env,
  }: {
    environment?: NodeJS.ProcessEnv;
  } = {}) {
    this.#environment = environment;
  }

  enable({ app }: ModuleContext): void {
    const service = new ThemeService({
      environment: this.#environment,
      preferenceStore: new ThemePreferenceStore(app),
    });

    service.initialize();

    nativeTheme.on("updated", () => {
      broadcastThemeState(service.syncResolvedTheme());
    });

    service.onDidChange((state) => {
      broadcastThemeState(state);
    });

    ipcMain.handle(GET_THEME_STATE_CHANNEL, () => service.getState());
    ipcMain.handle(SET_THEME_SOURCE_CHANNEL, (_event, themeSource: unknown) => {
      if (!isThemeSource(themeSource)) {
        throw new TypeError("Invalid theme source");
      }

      return service.setThemeSource(themeSource);
    });
  }
}

export function createThemeModule(...args: ConstructorParameters<typeof ThemeModule>) {
  return new ThemeModule(...args);
}
