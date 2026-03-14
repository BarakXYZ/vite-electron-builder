import type { AppInitConfig } from "../../../app/AppInitConfig.js";
import type { AppModule } from "../../../app/AppModule.js";
import type { ModuleContext } from "../../../app/ModuleContext.js";
import { isRendererUrlTarget } from "../../../app/rendererTarget.js";
import { BrowserWindow, nativeTheme } from "electron";
import { focusWindowIfInteractive, presentWindow } from "../../testing/E2EWindowPresentation.js";
import { DevToolsWindowManager } from "../devtools/DevToolsWindowManager.js";
import { getNativeBackgroundColor } from "../../theme/ThemePresentation.js";
import type { ResolvedTheme } from "../../theme/ThemeState.js";

class MainWindowManager implements AppModule {
  readonly #environment;
  readonly #preload: { path: string };
  readonly #renderer: { path: string } | URL;
  readonly #openDevTools;
  #devToolsWindowManager: DevToolsWindowManager | null;
  #mainWindow: BrowserWindow | null;

  constructor({
    environment = process.env,
    initConfig,
    openDevTools = false,
  }: {
    environment?: NodeJS.ProcessEnv;
    initConfig: AppInitConfig;
    openDevTools?: boolean;
  }) {
    this.#environment = environment;
    this.#preload = initConfig.preload;
    this.#renderer = initConfig.renderer;
    this.#openDevTools = openDevTools;
    this.#devToolsWindowManager = null;
    this.#mainWindow = null;
  }

  async enable({ app }: ModuleContext): Promise<void> {
    await app.whenReady();
    this.#devToolsWindowManager = this.#openDevTools ? new DevToolsWindowManager(app) : null;
    await this.restoreOrCreateWindow(true);
    app.on("second-instance", () => this.restoreOrCreateWindow(true));
    app.on("activate", () => this.restoreOrCreateWindow(true));
  }

  async createWindow(): Promise<BrowserWindow> {
    const browserWindow = new BrowserWindow({
      backgroundColor: getNativeBackgroundColor(getResolvedTheme()),
      show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: this.#preload.path,
        sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
        webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      },
    });

    if (isRendererUrlTarget(this.#renderer)) {
      await browserWindow.loadURL(this.#renderer.href);
    } else {
      await browserWindow.loadFile(this.#renderer.path);
    }

    const syncBackgroundColor = () => {
      browserWindow.setBackgroundColor(getNativeBackgroundColor(getResolvedTheme()));
    };

    nativeTheme.on("updated", syncBackgroundColor);

    browserWindow.on("closed", () => {
      nativeTheme.removeListener("updated", syncBackgroundColor);

      if (this.#mainWindow === browserWindow) {
        this.#mainWindow = null;
      }
    });

    return browserWindow;
  }

  async restoreOrCreateWindow(show = false) {
    let window = this.#mainWindow;

    if (window === null || window.isDestroyed()) {
      window = await this.createWindow();
      this.#mainWindow = window;
    }

    if (!show) {
      return window;
    }

    if (window.isMinimized()) {
      window.restore();
    }

    presentWindow(window, this.#environment);

    if (this.#openDevTools) {
      this.#devToolsWindowManager?.openFor(window);
    }

    focusWindowIfInteractive(window, this.#environment);

    return window;
  }
}

function getResolvedTheme(): ResolvedTheme {
  return nativeTheme.shouldUseDarkColors ? "dark" : "light";
}

export function createMainWindowModule(...args: ConstructorParameters<typeof MainWindowManager>) {
  return new MainWindowManager(...args);
}
