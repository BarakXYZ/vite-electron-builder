import { spawn } from "node:child_process";
import electronPath from "electron";
import { watch } from "node:fs";
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

function createElectronEnvironment(rendererDevServerUrl) {
  return {
    ...process.env,
    MODE: "development",
    NODE_ENV: "development",
    VITE_DEV_SERVER_URL: rendererDevServerUrl,
  };
}

function launchElectron(rendererDevServerUrl) {
  return spawn(String(electronPath), ["--inspect", appRootPath], {
    cwd: appRootPath,
    env: createElectronEnvironment(rendererDevServerUrl),
    stdio: "inherit",
  });
}

function createRestartController(restart) {
  let restartTimer = null;

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

async function main() {
  const startupTime = Date.now();
  await Promise.all([
    waitForBuildTaskState("desktop-main", { notBeforeMs: startupTime }),
    waitForBuildTaskState("desktop-preload", { notBeforeMs: startupTime }),
    waitForRendererDevServerUrl(),
  ]);

  let rendererDevServerUrl = await waitForRendererDevServerUrl();
  let electronProcess = launchElectron(rendererDevServerUrl);
  let isShuttingDown = false;
  let isRestarting = false;

  async function stopElectron() {
    if (electronProcess === null) {
      return;
    }

    const child = electronProcess;
    electronProcess = null;

    await new Promise((resolvePromise) => {
      child.once("exit", () => resolvePromise(undefined));
      child.kill("SIGTERM");
    });
  }

  async function restartElectron() {
    if (isRestarting || isShuttingDown) {
      return;
    }

    isRestarting = true;

    try {
      const nextRendererDevServerUrl =
        (await loadRendererDevServerUrl()) ?? (await waitForRendererDevServerUrl());
      rendererDevServerUrl = nextRendererDevServerUrl;
      await stopElectron();
      electronProcess = launchElectron(rendererDevServerUrl);
      electronProcess.once("exit", (code, signal) => {
        if (!isShuttingDown && !isRestarting && code !== 0) {
          process.exitCode = code ?? 1;
        }

        if (!isShuttingDown && !isRestarting && signal) {
          process.exitCode = 1;
        }
      });
    } finally {
      isRestarting = false;
    }
  }

  electronProcess.once("exit", (code, signal) => {
    if (isShuttingDown || isRestarting) {
      return;
    }

    process.exit(code ?? (signal ? 1 : 0));
  });

  const scheduleRestart = createRestartController(restartElectron);
  const watchedDirectories = [
    [dirname(stateFilePath), basename(stateFilePath)],
    [dirname(desktopMainStatePath), basename(desktopMainStatePath)],
    [dirname(desktopPreloadStatePath), basename(desktopPreloadStatePath)],
  ];
  const watchers = watchedDirectories.map(([directoryPath, fileName]) =>
    watch(directoryPath, (_eventType, changedFileName) => {
      if (changedFileName === null || changedFileName === fileName) {
        scheduleRestart();
      }
    }),
  );

  async function shutdown() {
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
