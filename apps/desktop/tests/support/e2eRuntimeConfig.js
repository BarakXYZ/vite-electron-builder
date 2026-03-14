// @ts-check

import process from "node:process";
import { URL, fileURLToPath, pathToFileURL } from "node:url";

/** @typedef {"hidden" | "background" | "interactive"} E2EWindowMode */
/** @typedef {{ readonly windowMode: E2EWindowMode }} E2ERuntimeConfig */
/** @typedef {{ environment: NodeJS.ProcessEnv; fileConfig: unknown; windowModeOverride: string | undefined }} ResolveWindowModeInput */
/** @typedef {{ configPath?: string | undefined; environment?: NodeJS.ProcessEnv; windowModeOverride?: string | undefined }} LoadE2ERuntimeConfigOptions */

/** @type {E2ERuntimeConfig} */
const DEFAULT_E2E_RUNTIME_CONFIG = {
  windowMode: "hidden",
};

const E2E_WINDOW_MODES = ["hidden", "background", "interactive"];
const E2E_RUNTIME_CONFIG_PATH = fileURLToPath(new URL("../e2e.runtime.config.js", import.meta.url));
const E2E_WINDOW_MODE_SET = new Set(E2E_WINDOW_MODES);

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
  return typeof value === "object" && value !== null;
}

/**
 * @param {unknown} value
 * @returns {value is E2EWindowMode}
 */
function isE2EWindowMode(value) {
  return typeof value === "string" && E2E_WINDOW_MODE_SET.has(value);
}

/**
 * @param {ResolveWindowModeInput} input
 * @returns {E2EWindowMode}
 */
function resolveConfiguredWindowMode({ environment, fileConfig, windowModeOverride }) {
  if (isE2EWindowMode(windowModeOverride)) {
    return windowModeOverride;
  }

  if (isE2EWindowMode(environment.APP_E2E_WINDOW_MODE)) {
    return environment.APP_E2E_WINDOW_MODE;
  }

  if (isRecord(fileConfig) && isE2EWindowMode(fileConfig.windowMode)) {
    return fileConfig.windowMode;
  }

  return DEFAULT_E2E_RUNTIME_CONFIG.windowMode;
}

/**
 * @param {E2ERuntimeConfig} config
 * @returns {E2ERuntimeConfig}
 */
export function defineE2ERuntimeConfig(config) {
  const windowMode = isE2EWindowMode(config.windowMode)
    ? config.windowMode
    : DEFAULT_E2E_RUNTIME_CONFIG.windowMode;

  return {
    windowMode,
  };
}

/**
 * @param {LoadE2ERuntimeConfigOptions} [options]
 * @returns {Promise<E2ERuntimeConfig>}
 */
export async function loadE2ERuntimeConfig(options = {}) {
  const {
    configPath = E2E_RUNTIME_CONFIG_PATH,
    environment = process.env,
    windowModeOverride,
  } = options;

  const configUrl = pathToFileURL(configPath);
  const { default: fileConfig } = await import(configUrl.href);

  return {
    windowMode: resolveConfiguredWindowMode({
      environment,
      fileConfig,
      windowModeOverride,
    }),
  };
}

export { DEFAULT_E2E_RUNTIME_CONFIG, E2E_RUNTIME_CONFIG_PATH, E2E_WINDOW_MODES };
