import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRootPath = dirname(fileURLToPath(new URL("../../package.json", import.meta.url)));
const stateDirectoryPath = resolve(appRootPath, ".turbo", "dev");
const stateFilePath = resolve(stateDirectoryPath, "renderer-dev-server.json");
const defaultPollIntervalMs = 100;
const defaultTimeoutMs = 30_000;

/**
 * @param {string} url
 */
function assertRendererDevServerUrl(url) {
  if (typeof url !== "string" || url.length === 0) {
    throw new TypeError("Renderer dev server URL must be a non-empty string.");
  }

  new URL(url);
}

/**
 * @param {number} milliseconds
 */
function delay(milliseconds) {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, milliseconds);
  });
}

async function ensureStateDirectory() {
  await mkdir(stateDirectoryPath, { recursive: true });
}

/**
 * @param {string} url
 * @returns {Promise<boolean>}
 */
async function isReachableRendererDevServerUrl(url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(1000),
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function readStateFile() {
  try {
    return JSON.parse(await readFile(stateFilePath, "utf8"));
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
 * @returns {Promise<string | null>}
 */
export async function loadRendererDevServerUrl() {
  const state = await readStateFile();
  if (!state || typeof state.url !== "string") {
    return null;
  }

  assertRendererDevServerUrl(state.url);
  return state.url;
}

/**
 * @param {string} url
 */
export async function writeRendererDevServerUrl(url) {
  assertRendererDevServerUrl(url);
  await ensureStateDirectory();
  await writeFile(stateFilePath, `${JSON.stringify({ url }, null, 2)}\n`, "utf8");
}

export async function clearRendererDevServerUrl() {
  await rm(stateFilePath, { force: true });
}

/**
 * @param {{ pollIntervalMs?: number; timeoutMs?: number }} [options]
 * @returns {Promise<string>}
 */
export async function waitForRendererDevServerUrl(options = {}) {
  const { pollIntervalMs = defaultPollIntervalMs, timeoutMs = defaultTimeoutMs } = options;
  const startTime = Date.now();

  while (Date.now() - startTime <= timeoutMs) {
    const url = await loadRendererDevServerUrl();
    if (url !== null && (await isReachableRendererDevServerUrl(url))) {
      return url;
    }

    await delay(pollIntervalMs);
  }

  throw new Error(
    `Timed out waiting for renderer dev server URL after ${String(timeoutMs)}ms (${stateFilePath}).`,
  );
}

export { appRootPath, stateDirectoryPath, stateFilePath };
