import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRootPath = dirname(fileURLToPath(new URL("../../package.json", import.meta.url)));
const stateDirectoryPath = resolve(appRootPath, ".turbo", "dev");
const defaultPollIntervalMs = 100;
const defaultTimeoutMs = 30_000;

export type DesktopBuildTaskName = "desktop-main" | "desktop-preload";

type BuildTaskState = {
  updatedAt: number;
};

type WaitForBuildTaskStateOptions = {
  notBeforeMs?: number;
  pollIntervalMs?: number;
  timeoutMs?: number;
};

const validBuildTaskNames = new Set<DesktopBuildTaskName>(["desktop-main", "desktop-preload"]);

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, milliseconds);
  });
}

function assertBuildTaskName(taskName: string): asserts taskName is DesktopBuildTaskName {
  if (!validBuildTaskNames.has(taskName as DesktopBuildTaskName)) {
    throw new TypeError(`Unsupported desktop build task: ${taskName}`);
  }
}

export function getBuildTaskStatePath(taskName: DesktopBuildTaskName): string {
  assertBuildTaskName(taskName);
  return resolve(stateDirectoryPath, `${taskName}.json`);
}

async function ensureStateDirectory(): Promise<void> {
  await mkdir(stateDirectoryPath, { recursive: true });
}

async function readBuildState(taskName: DesktopBuildTaskName): Promise<BuildTaskState | null> {
  try {
    return JSON.parse(await readFile(getBuildTaskStatePath(taskName), "utf8")) as BuildTaskState;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error.code === "ENOENT" || error.code === "ENOTDIR")
    ) {
      return null;
    }

    throw error;
  }
}

export async function writeBuildTaskState(taskName: DesktopBuildTaskName): Promise<void> {
  assertBuildTaskName(taskName);
  await ensureStateDirectory();
  const buildTaskState: BuildTaskState = {
    updatedAt: Date.now(),
  };
  await writeFile(
    getBuildTaskStatePath(taskName),
    `${JSON.stringify(buildTaskState, null, 2)}\n`,
    "utf8",
  );
}

export async function waitForBuildTaskState(
  taskName: DesktopBuildTaskName,
  options: WaitForBuildTaskStateOptions = {},
): Promise<void> {
  assertBuildTaskName(taskName);

  const {
    notBeforeMs = 0,
    pollIntervalMs = defaultPollIntervalMs,
    timeoutMs = defaultTimeoutMs,
  } = options;
  const startTime = Date.now();

  while (Date.now() - startTime <= timeoutMs) {
    const state = await readBuildState(taskName);
    if (state && state.updatedAt >= notBeforeMs) {
      return;
    }

    await delay(pollIntervalMs);
  }

  throw new Error(`Timed out waiting for ${taskName} build readiness signal.`);
}
