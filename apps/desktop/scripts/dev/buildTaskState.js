import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRootPath = dirname(fileURLToPath(new URL("../../package.json", import.meta.url)));
const stateDirectoryPath = resolve(appRootPath, ".turbo", "dev");
const defaultPollIntervalMs = 100;
const defaultTimeoutMs = 30_000;
const validBuildTaskNames = new Set(["desktop-main", "desktop-preload"]);

/**
 * @param {number} milliseconds
 */
function delay(milliseconds) {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, milliseconds);
  });
}

/**
 * @param {string} taskName
 */
function assertBuildTaskName(taskName) {
  if (!validBuildTaskNames.has(taskName)) {
    throw new TypeError(`Unsupported desktop build task: ${taskName}`);
  }
}

/**
 * @param {string} taskName
 */
export function getBuildTaskStatePath(taskName) {
  assertBuildTaskName(taskName);
  return resolve(stateDirectoryPath, `${taskName}.json`);
}

async function ensureStateDirectory() {
  await mkdir(stateDirectoryPath, { recursive: true });
}

/**
 * @param {string} taskName
 */
async function readBuildState(taskName) {
  try {
    return JSON.parse(await readFile(getBuildTaskStatePath(taskName), "utf8"));
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

/**
 * @param {"desktop-main" | "desktop-preload"} taskName
 */
export async function writeBuildTaskState(taskName) {
  assertBuildTaskName(taskName);
  await ensureStateDirectory();
  await writeFile(
    getBuildTaskStatePath(taskName),
    `${JSON.stringify({ updatedAt: Date.now() }, null, 2)}\n`,
    "utf8",
  );
}

/**
 * @param {"desktop-main" | "desktop-preload"} taskName
 * @param {{ notBeforeMs?: number; pollIntervalMs?: number; timeoutMs?: number }} [options]
 */
export async function waitForBuildTaskState(taskName, options = {}) {
  assertBuildTaskName(taskName);

  const {
    notBeforeMs = 0,
    pollIntervalMs = defaultPollIntervalMs,
    timeoutMs = defaultTimeoutMs,
  } = options;
  const startTime = Date.now();

  while (Date.now() - startTime <= timeoutMs) {
    const state = await readBuildState(taskName);
    if (
      state &&
      typeof state === "object" &&
      "updatedAt" in state &&
      typeof state.updatedAt === "number" &&
      state.updatedAt >= notBeforeMs
    ) {
      return;
    }

    await delay(pollIntervalMs);
  }

  throw new Error(`Timed out waiting for ${taskName} build readiness signal.`);
}
