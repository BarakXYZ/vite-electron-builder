import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRootPath = dirname(fileURLToPath(new URL("../../package.json", import.meta.url)));
const stateDirectoryPath = resolve(appRootPath, ".turbo", "dev");
const stateFilePath = resolve(stateDirectoryPath, "renderer-dev-server.json");
const defaultPollIntervalMs = 100;
const defaultTimeoutMs = 30_000;

type RendererDevServerState = {
  url: string;
};

type WaitForRendererDevServerUrlOptions = {
  pollIntervalMs?: number;
  timeoutMs?: number;
};

function assertRendererDevServerUrl(url: string): void {
  if (url.length === 0) {
    throw new TypeError("Renderer dev server URL must be a non-empty string.");
  }

  new URL(url);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, milliseconds);
  });
}

async function ensureStateDirectory(): Promise<void> {
  await mkdir(stateDirectoryPath, { recursive: true });
}

async function isReachableRendererDevServerUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(1000),
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function readStateFile(): Promise<RendererDevServerState | null> {
  try {
    return JSON.parse(await readFile(stateFilePath, "utf8")) as RendererDevServerState;
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

export async function loadRendererDevServerUrl(): Promise<string | null> {
  const state = await readStateFile();
  if (!state) {
    return null;
  }

  assertRendererDevServerUrl(state.url);
  return state.url;
}

export async function writeRendererDevServerUrl(url: string): Promise<void> {
  assertRendererDevServerUrl(url);
  await ensureStateDirectory();
  const rendererDevServerState: RendererDevServerState = { url };
  await writeFile(stateFilePath, `${JSON.stringify(rendererDevServerState, null, 2)}\n`, "utf8");
}

export async function clearRendererDevServerUrl(): Promise<void> {
  await rm(stateFilePath, { force: true });
}

export async function waitForRendererDevServerUrl(
  options: WaitForRendererDevServerUrlOptions = {},
): Promise<string> {
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
