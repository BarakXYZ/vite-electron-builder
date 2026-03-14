import type { AppModule } from "../AppModule.js";
import { ModuleContext } from "../ModuleContext.js";
import { BrowserWindow } from "electron";
import type { AppInitConfig } from "../AppInitConfig.js";
import { DevToolsWindowManager } from "./DevToolsWindowManager.js";

class WindowManager implements AppModule {
  readonly #preload: { path: string };
  readonly #renderer: { path: string } | URL;
  readonly #openDevTools;
  #devToolsWindowManager: DevToolsWindowManager | null;
  #mainWindow: BrowserWindow | null;

  constructor({
    initConfig,
    openDevTools = false,
  }: {
    initConfig: AppInitConfig;
    openDevTools?: boolean;
  }) {
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
      show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
        webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
        preload: this.#preload.path,
      },
    });

    if (this.#renderer instanceof URL) {
      await browserWindow.loadURL(this.#renderer.href);
    } else {
      await browserWindow.loadFile(this.#renderer.path);
    }

    browserWindow.on("closed", () => {
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

    window.show();

    if (this.#openDevTools) {
      this.#devToolsWindowManager?.openFor(window);
    }

    window.focus();

    return window;
  }
}

export function createWindowManagerModule(...args: ConstructorParameters<typeof WindowManager>) {
  return new WindowManager(...args);
}
