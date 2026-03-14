import { spawn, type ChildProcess } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appRootPath = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const workspaceRootPath = dirname(dirname(appRootPath));
const shutdownTimeoutMs = 5000;

function getPnpmCommand(): string {
  return process.platform === "win32" ? "pnpm.cmd" : "pnpm";
}

function spawnProcess(
  command: string,
  args: Array<string>,
  cwd: string,
  environment: NodeJS.ProcessEnv = process.env,
): ChildProcess {
  return spawn(command, args, {
    cwd,
    detached: process.platform !== "win32",
    env: environment,
    stdio: "inherit",
  });
}

function waitForExit(childProcess: ChildProcess): Promise<number> {
  return new Promise((resolve, reject) => {
    childProcess.once("error", reject);
    childProcess.once("exit", (code, signal) => {
      resolve(code ?? (signal ? 1 : 0));
    });
  });
}

async function terminateChildProcess(childProcess: ChildProcess | null): Promise<void> {
  if (childProcess === null || childProcess.exitCode !== null) {
    return;
  }

  if (process.platform === "win32") {
    childProcess.kill("SIGTERM");
  } else if (childProcess.pid !== undefined) {
    process.kill(-childProcess.pid, "SIGTERM");
  } else {
    childProcess.kill("SIGTERM");
  }

  const exitPromise = waitForExit(childProcess).catch(() => 1);
  const timeoutPromise = new Promise<number>((resolvePromise) => {
    setTimeout(() => resolvePromise(-1), shutdownTimeoutMs);
  });

  const exitCode = await Promise.race([exitPromise, timeoutPromise]);
  if (exitCode === -1 && childProcess.exitCode === null) {
    if (process.platform === "win32") {
      childProcess.kill("SIGKILL");
    } else if (childProcess.pid !== undefined) {
      process.kill(-childProcess.pid, "SIGKILL");
    } else {
      childProcess.kill("SIGKILL");
    }
    await exitPromise;
  }
}

async function main(): Promise<void> {
  const pnpmCommand = getPnpmCommand();
  const companionProcesses = [
    spawnProcess(pnpmCommand, ["--filter", "@app/desktop-renderer", "dev"], workspaceRootPath),
    spawnProcess(pnpmCommand, ["--filter", "@app/desktop-main", "dev"], workspaceRootPath),
    spawnProcess(pnpmCommand, ["--filter", "@app/desktop-preload", "dev"], workspaceRootPath),
  ];
  const runtimeProcess = spawnProcess(
    pnpmCommand,
    ["exec", "tsx", "./scripts/dev-runtime.ts"],
    appRootPath,
  );

  let isShuttingDown = false;

  async function shutdown(exitCode = 0): Promise<void> {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    await Promise.all([
      terminateChildProcess(runtimeProcess),
      ...companionProcesses.map((childProcess) => terminateChildProcess(childProcess)),
    ]);
    process.exit(exitCode);
  }

  for (const companionProcess of companionProcesses) {
    companionProcess.once("exit", (code, signal) => {
      if (isShuttingDown) {
        return;
      }

      void shutdown(code ?? (signal ? 1 : 0));
    });
  }

  runtimeProcess.once("exit", (code, signal) => {
    if (isShuttingDown) {
      return;
    }

    void shutdown(code ?? (signal ? 1 : 0));
  });

  process.on("SIGINT", () => {
    void shutdown(0);
  });
  process.on("SIGTERM", () => {
    void shutdown(0);
  });
}

await main();
