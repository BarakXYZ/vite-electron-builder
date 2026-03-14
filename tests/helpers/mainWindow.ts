import type { Page } from "@playwright/test";
import type { BrowserWindow } from "electron";
import type { ElectronApplication, JSHandle } from "playwright";

export type MainWindowState = {
  backgroundColor: string;
  isCrashed: boolean;
  isDevToolsOpened: boolean;
  isVisible: boolean;
};

export async function getMainWindowState(
  electronApp: ElectronApplication,
  page: Page,
): Promise<MainWindowState> {
  const windowHandle: JSHandle<BrowserWindow> = await electronApp.browserWindow(page);

  return windowHandle.evaluate((mainWindow): MainWindowState => {
    return {
      backgroundColor: mainWindow.getBackgroundColor(),
      isCrashed: mainWindow.webContents.isCrashed(),
      isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
      isVisible: mainWindow.isVisible(),
    };
  });
}
