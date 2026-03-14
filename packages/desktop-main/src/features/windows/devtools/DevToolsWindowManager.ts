import type { BrowserWindowConstructorOptions, Rectangle } from "electron";
import { app, BrowserWindow, screen } from "electron";

import { DevToolsWindowStateStore, type DevToolsWindowState } from "./DevToolsWindowStateStore.js";

const DEFAULT_BOUNDS = {
  height: 720,
  width: 1080,
};

const MIN_HEIGHT = 480;
const MIN_WIDTH = 720;

function clampBounds(bounds: Rectangle): Rectangle {
  return {
    height: Math.max(MIN_HEIGHT, Math.round(bounds.height)),
    width: Math.max(MIN_WIDTH, Math.round(bounds.width)),
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
  };
}

function getCenteredBounds(bounds: Rectangle): Rectangle {
  const workArea = screen.getPrimaryDisplay().workArea;
  const width = Math.min(bounds.width, workArea.width);
  const height = Math.min(bounds.height, workArea.height);

  return {
    height,
    width,
    x: Math.round(workArea.x + (workArea.width - width) / 2),
    y: Math.round(workArea.y + (workArea.height - height) / 2),
  };
}

function hasVisibleIntersection(bounds: Rectangle): boolean {
  const display = screen.getDisplayMatching(bounds);
  const workArea = display.workArea;

  const left = Math.max(bounds.x, workArea.x);
  const top = Math.max(bounds.y, workArea.y);
  const right = Math.min(bounds.x + bounds.width, workArea.x + workArea.width);
  const bottom = Math.min(bounds.y + bounds.height, workArea.y + workArea.height);

  return right > left && bottom > top;
}

function resolveInitialBounds(state: DevToolsWindowState | null): BrowserWindowConstructorOptions {
  const fallbackBounds = getCenteredBounds({
    ...DEFAULT_BOUNDS,
    x: 0,
    y: 0,
  });

  if (state === null) {
    return fallbackBounds;
  }

  const normalizedBounds = clampBounds(state.bounds);

  return hasVisibleIntersection(normalizedBounds)
    ? normalizedBounds
    : getCenteredBounds(normalizedBounds);
}

export class DevToolsWindowManager {
  readonly #stateStore: DevToolsWindowStateStore;
  #window: BrowserWindow | null;

  constructor(electronApp: Electron.App) {
    this.#stateStore = new DevToolsWindowStateStore(electronApp);
    this.#window = null;
  }

  openFor(parentWindow: BrowserWindow): BrowserWindow {
    if (this.#window !== null && !this.#window.isDestroyed()) {
      this.#showWithoutFocusing(parentWindow, this.#window);
      return this.#window;
    }

    const savedState = this.#stateStore.load();
    const browserWindow = new BrowserWindow({
      autoHideMenuBar: true,
      show: false,
      title: `${app.getName()} DevTools`,
      ...resolveInitialBounds(savedState),
    });

    this.#window = browserWindow;

    parentWindow.webContents.setDevToolsWebContents(browserWindow.webContents);
    parentWindow.webContents.openDevTools({
      activate: false,
      mode: "detach",
      title: `${app.getName()} DevTools`,
    });

    browserWindow.once("ready-to-show", () => {
      if (savedState?.isMaximized) {
        browserWindow.maximize();
      }

      this.#showWithoutFocusing(parentWindow, browserWindow);
    });

    browserWindow.on("moved", () => this.#saveCurrentState(browserWindow));
    browserWindow.on("resized", () => this.#saveCurrentState(browserWindow));
    browserWindow.on("maximize", () => this.#saveCurrentState(browserWindow));
    browserWindow.on("unmaximize", () => this.#saveCurrentState(browserWindow));

    browserWindow.on("close", () => {
      this.#saveCurrentState(browserWindow);
    });

    browserWindow.on("closed", () => {
      this.#window = null;
    });

    parentWindow.webContents.once("devtools-closed", () => {
      this.destroy();
    });

    parentWindow.once("closed", () => {
      this.destroy();
    });

    return browserWindow;
  }

  destroy(): void {
    if (this.#window === null || this.#window.isDestroyed()) {
      this.#window = null;
      return;
    }

    const browserWindow = this.#window;
    this.#saveCurrentState(browserWindow);
    this.#window = null;
    browserWindow.destroy();
  }

  #showWithoutFocusing(parentWindow: BrowserWindow, browserWindow: BrowserWindow): void {
    browserWindow.showInactive();

    if (!parentWindow.isDestroyed() && !parentWindow.isFocused()) {
      parentWindow.focus();
    }
  }

  #saveCurrentState(browserWindow: BrowserWindow): void {
    if (browserWindow.isDestroyed()) {
      return;
    }

    this.#stateStore.save({
      bounds: clampBounds(
        browserWindow.isMaximized() ? browserWindow.getNormalBounds() : browserWindow.getBounds(),
      ),
      isMaximized: browserWindow.isMaximized(),
    });
  }
}
