import { spawn, type ChildProcess } from "node:child_process";
import electronPath from "electron";
import { type FSWatcher, watch } from "node:fs";
import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getBuildTaskStatePath, waitForBuildTaskState } from "./dev/buildTaskState.js";
import {
  loadRendererDevServerUrl,
  stateFilePath,
  waitForRendererDevServerUrl,
} from "./dev/rendererDevServerState.js";

const appRootPath = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const desktopMainStatePath = getBuildTaskStatePath("desktop-main");
const desktopPreloadStatePath = getBuildTaskStatePath("desktop-preload");
const restartDebounceMs = 150;

function createElectronEnvironment(rendererDevServerUrl: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    APP_OPEN_DEVTOOLS: "true",
    MODE: "development",
    NODE_ENV: "development",
    VITE_DEV_SERVER_URL: rendererDevServerUrl,
  };
}

function launchElectron(rendererDevServerUrl: string): ChildProcess {
  return spawn(String(electronPath), ["--inspect", appRootPath], {
    cwd: appRootPath,
    env: createElectronEnvironment(rendererDevServerUrl),
    stdio: "inherit",
  });
}

function createRestartController(restart: () => Promise<void>): () => void {
  let restartTimer: NodeJS.Timeout | null = null;

  return () => {
    if (restartTimer !== null) {
      clearTimeout(restartTimer);
    }

    restartTimer = setTimeout(() => {
      restartTimer = null;
      void restart();
    }, restartDebounceMs);
  };
}

function trackUnexpectedExit({
  electronProcess,
  isRestarting,
  isShuttingDown,
}: {
  electronProcess: ChildProcess;
  isRestarting: () => boolean;
  isShuttingDown: () => boolean;
}): void {
  electronProcess.once("exit", (code, signal) => {
    if (isShuttingDown() || isRestarting()) {
      return;
    }

    process.exit(code ?? (signal ? 1 : 0));
  });
}

async function main(): Promise<void> {
  const startupTime = Date.now();
  await Promise.all([
    waitForBuildTaskState("desktop-main", { notBeforeMs: startupTime }),
    waitForBuildTaskState("desktop-preload", { notBeforeMs: startupTime }),
    waitForRendererDevServerUrl(),
  ]);

  let electronProcess: ChildProcess | null = launchElectron(await waitForRendererDevServerUrl());
  let isShuttingDown = false;
  let isRestarting = false;

  trackUnexpectedExit({
    electronProcess,
    isRestarting: () => isRestarting,
    isShuttingDown: () => isShuttingDown,
  });

  async function stopElectron(): Promise<void> {
    if (electronProcess === null) {
      return;
    }

    const child = electronProcess;
    electronProcess = null;

    await new Promise<void>((resolvePromise) => {
      child.once("exit", () => resolvePromise());
      child.kill("SIGTERM");
    });
  }

  async function restartElectron(): Promise<void> {
    if (isRestarting || isShuttingDown) {
      return;
    }

    isRestarting = true;

    try {
      const nextRendererDevServerUrl =
        (await loadRendererDevServerUrl()) ?? (await waitForRendererDevServerUrl());
      await stopElectron();
      electronProcess = launchElectron(nextRendererDevServerUrl);
      trackUnexpectedExit({
        electronProcess,
        isRestarting: () => isRestarting,
        isShuttingDown: () => isShuttingDown,
      });
    } finally {
      isRestarting = false;
    }
  }

  const scheduleRestart = createRestartController(restartElectron);
  const watchedDirectories: ReadonlyArray<readonly [string, string]> = [
    [dirname(stateFilePath), basename(stateFilePath)],
    [dirname(desktopMainStatePath), basename(desktopMainStatePath)],
    [dirname(desktopPreloadStatePath), basename(desktopPreloadStatePath)],
  ];
  const watchers: Array<FSWatcher> = watchedDirectories.map(([directoryPath, fileName]) =>
    watch(directoryPath, (_eventType, changedFileName) => {
      if (changedFileName === null || changedFileName === fileName) {
        scheduleRestart();
      }
    }),
  );

  async function shutdown(): Promise<void> {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    for (const watcher of watchers) {
      watcher.close();
    }

    await stopElectron();
    process.exit(0);
  }

  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });
}

await main();
