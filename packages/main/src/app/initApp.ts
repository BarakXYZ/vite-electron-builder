import type { AppInitConfig } from "./AppInitConfig.js";
import { createModuleRunner } from "./ModuleRunner.js";
import { isRendererUrlTarget } from "./rendererTarget.js";
import { disallowMultipleAppInstance } from "../features/lifecycle/SingleInstanceApp.js";
import { terminateAppOnLastWindowClose } from "../features/lifecycle/ApplicationTerminatorOnLastWindowClose.js";
import { hardwareAccelerationMode } from "../features/platform/HardwareAccelerationModule.js";
import { allowInternalOrigins } from "../features/security/BlockNotAllowedOrigins.js";
import { allowExternalUrls } from "../features/security/ExternalUrls.js";
import { denyPermissionRequests } from "../features/security/PermissionRequests.js";
import { createThemeModule } from "../features/theme/ThemeModule.js";
import { autoUpdater } from "../features/updates/AutoUpdater.js";
import { createMainWindowModule } from "../features/windows/main/MainWindowManager.js";

function getAllowedExternalOrigins(rendererTarget: AppInitConfig["renderer"]): Set<string> {
  return new Set(
    isRendererUrlTarget(rendererTarget)
      ? [
          "https://vite.dev",
          "https://developer.mozilla.org",
          "https://solidjs.com",
          "https://qwik.dev",
          "https://lit.dev",
          "https://react.dev",
          "https://preactjs.com",
          "https://www.typescriptlang.org",
          "https://vuejs.org",
        ]
      : [],
  );
}

function getInternalOrigins(rendererTarget: AppInitConfig["renderer"]): Set<string> {
  return new Set(isRendererUrlTarget(rendererTarget) ? [rendererTarget.origin] : []);
}

export async function initApp({
  environment = process.env,
  initConfig,
}: {
  environment?: NodeJS.ProcessEnv;
  initConfig: AppInitConfig;
}) {
  const moduleRunner = createModuleRunner()
    .init(disallowMultipleAppInstance())
    .init(createThemeModule({ environment }))
    .init(terminateAppOnLastWindowClose())
    .init(hardwareAccelerationMode({ enable: false }))
    .init(autoUpdater())
    .init(createMainWindowModule({ initConfig, openDevTools: import.meta.env.DEV }))

    // Install DevTools extension if needed.
    // .init(chromeDevToolsExtension({ extension: "VUEJS3_DEVTOOLS" }))

    // Security
    .init(allowInternalOrigins(getInternalOrigins(initConfig.renderer)))
    .init(denyPermissionRequests())
    .init(allowExternalUrls(getAllowedExternalOrigins(initConfig.renderer)));

  await moduleRunner;
}
