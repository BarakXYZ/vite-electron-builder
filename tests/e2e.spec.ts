import { expect, test as base, type Page } from "@playwright/test";
import type { BrowserWindow } from "electron";
import { _electron as electron, type ElectronApplication, type JSHandle } from "playwright";
import { createHash } from "node:crypto";
import { createElectronAppProfile } from "./support/electronAppProfile";

type TestFixtures = {
  electronVersions: NodeJS.ProcessVersions;
};

type MainWindowState = {
  isCrashed: boolean;
  isDevToolsOpened: boolean;
  isVisible: boolean;
};

type WorkerFixtures = {
  electronApp: ElectronApplication;
  themeSource: "dark" | "light";
};

async function getMainWindowState(
  electronApp: ElectronApplication,
  page: Page,
): Promise<MainWindowState> {
  const windowHandle: JSHandle<BrowserWindow> = await electronApp.browserWindow(page);

  return windowHandle.evaluate((mainWindow): Promise<MainWindowState> => {
    const getState = () => ({
      isCrashed: mainWindow.webContents.isCrashed(),
      isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
      isVisible: mainWindow.isVisible(),
    });

    return new Promise((resolve) => {
      if (mainWindow.isVisible()) {
        resolve(getState());
        return;
      }

      mainWindow.once("ready-to-show", () => resolve(getState()));
    });
  });
}

const test = base.extend<TestFixtures, WorkerFixtures>({
  electronApp: [
    async ({ themeSource }, use, workerInfo) => {
      const profile = await createElectronAppProfile(workerInfo.parallelIndex);
      const electronApp = await electron.launch({
        args: ["."],
        env: {
          ...process.env,
          APP_LOGS_PATH: profile.logsPath,
          APP_SESSION_DATA_PATH: profile.sessionDataPath,
          APP_THEME_SOURCE: themeSource,
          APP_USER_DATA_PATH: profile.rootPath,
          PLAYWRIGHT_TEST: "true",
        },
      });

      try {
        await use(electronApp);
      } finally {
        await electronApp.close();
        await profile.cleanup();
      }
    },
    { auto: true, scope: "worker" },
  ],

  electronVersions: async ({ electronApp }, use) => {
    await use(await electronApp.evaluate(() => process.versions));
  },

  page: async ({ electronApp, themeSource }, use) => {
    const page = await electronApp.firstWindow();

    await page.emulateMedia({ colorScheme: themeSource });
    await page.waitForLoadState("load");
    await use(page);
  },

  themeSource: [
    async ({}, use, workerInfo) => {
      await use(workerInfo.project.use.colorScheme === "dark" ? "dark" : "light");
    },
    { scope: "worker" },
  ],
});

test("Main window state", async ({ electronApp, page }) => {
  const windowState = await getMainWindowState(electronApp, page);

  expect(windowState.isCrashed, "The app has crashed").toEqual(false);
  expect(windowState.isVisible, "The main window was not visible").toEqual(true);
  expect(windowState.isDevToolsOpened, "The DevTools panel was open").toEqual(false);
});

test.describe("Main window web content", () => {
  test("The main window resolves the configured theme project", async ({ page, themeSource }) => {
    const themeState = await page.evaluate(async () => {
      const state = await window.electronAPI.theme.getState();

      return {
        documentClassName: document.documentElement.className,
        mediaPrefersDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
        state,
      };
    });

    expect(themeState.state.themeSource).toEqual(themeSource);
    expect(themeState.state.resolvedTheme).toEqual(themeSource);
    expect(themeState.documentClassName).toContain(themeSource);
    expect(themeState.mediaPrefersDark).toEqual(themeSource === "dark");
  });

  test("The main window has an interactive button", async ({ page }) => {
    const element = page.getByRole("button", { name: /count is \d+/ });
    await expect(element).toBeVisible();
    await expect(element).toHaveText("count is 0");
    await element.click();
    await expect(element).toHaveText("count is 1");
  });

  test("The main window renders the app shell", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Electron Workspace" })).toBeVisible();
    await expect(page.getByRole("button", { name: "System" })).toBeVisible();
  });
});

test.describe("Preload context should be exposed", () => {
  test("with a single explicit bridge object", async ({ page }) => {
    const type = await page.evaluate(() => typeof window.electronAPI);
    expect(type).toEqual("object");
  });

  test("with a theme bridge", async ({ page }) => {
    const type = await page.evaluate(() => typeof window.electronAPI.theme);
    expect(type).toEqual("object");
  });

  test.describe("versions should be exposed", () => {
    test("with same type`", async ({ page }) => {
      const type = await page.evaluate(() => typeof window.electronAPI.versions);
      expect(type).toEqual("object");
    });

    test("with same value", async ({ electronVersions, page }) => {
      const value = await page.evaluate(() => window.electronAPI.versions);
      expect(value).toEqual(electronVersions);
    });
  });

  test.describe("sha256sum should be exposed", () => {
    test("with same type`", async ({ page }) => {
      const type = await page.evaluate(() => typeof window.electronAPI.sha256sum);
      expect(type).toEqual("function");
    });

    test("with same behavior", async ({ page }) => {
      const testString = btoa(`${Date.now() * Math.random()}`);
      const expectedValue = createHash("sha256").update(testString).digest("hex");
      const value = await page.evaluate((str) => window.electronAPI.sha256sum(str), testString);
      expect(value).toEqual(expectedValue);
    });
  });
});
