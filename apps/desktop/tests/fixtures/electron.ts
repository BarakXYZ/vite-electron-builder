import { expect, test as base } from "@playwright/test";
import { fileURLToPath } from "node:url";
import type { ElectronApplication } from "playwright";
import { _electron as electron } from "playwright";
import { createElectronAppProfile } from "../support/electronAppProfile.js";
import { loadE2ERuntimeConfig, type E2EWindowMode } from "../support/e2eRuntimeConfig.js";

const desktopAppRootPath = fileURLToPath(new URL("../../", import.meta.url));

export type AppThemeSource = "dark" | "light" | "system";

type TestFixtures = {
  electronVersions: NodeJS.ProcessVersions;
};

type WorkerFixtures = {
  electronApp: ElectronApplication;
  themeSource: AppThemeSource;
  windowMode: E2EWindowMode;
};

function resolveProjectThemeSource(colorScheme: unknown): AppThemeSource {
  if (colorScheme === "dark" || colorScheme === "light") {
    return colorScheme;
  }

  return "system";
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  electronApp: [
    async ({ themeSource, windowMode }, use, workerInfo) => {
      const profile = await createElectronAppProfile(workerInfo.parallelIndex);
      const electronApp = await electron.launch({
        args: [desktopAppRootPath],
        cwd: desktopAppRootPath,
        env: {
          ...process.env,
          APP_E2E_WINDOW_MODE: windowMode,
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
    { auto: true, box: true, scope: "worker", title: "launch electron app" },
  ],

  electronVersions: async ({ electronApp }, use) => {
    await use(await electronApp.evaluate(() => process.versions));
  },

  page: async ({ electronApp, themeSource }, use) => {
    const page = await electronApp.firstWindow();

    await page.emulateMedia({
      colorScheme: themeSource === "system" ? null : themeSource,
    });
    await page.waitForLoadState("load");
    await use(page);
  },

  themeSource: [
    async ({}, use, workerInfo) => {
      await use(resolveProjectThemeSource(workerInfo.project.use.colorScheme));
    },
    { box: true, scope: "worker", title: "resolve theme project" },
  ],

  windowMode: [
    async ({}, use) => {
      const runtimeConfig = await loadE2ERuntimeConfig({
        environment: process.env,
      });
      await use(runtimeConfig.windowMode);
    },
    { box: true, scope: "worker", title: "resolve e2e window mode" },
  ],
});

export { expect };
