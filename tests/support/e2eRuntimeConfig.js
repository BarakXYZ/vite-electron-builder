// @ts-check

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

/** @type {{ windowMode: "hidden" }} */
const DEFAULT_E2E_RUNTIME_CONFIG = {
  windowMode: "hidden",
};

const E2E_WINDOW_MODES = ["hidden", "background", "interactive"];
const E2E_RUNTIME_CONFIG_PATH = resolve(process.cwd(), "tests/e2e.runtime.config.json");
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
 * @returns {value is "hidden" | "background" | "interactive"}
 */
function isE2EWindowMode(value) {
  return typeof value === "string" && E2E_WINDOW_MODE_SET.has(value);
}

/**
 * @param {string} configPath
 * @returns {unknown}
 */
function readRuntimeConfigFile(configPath) {
  const fileContents = readFileSync(configPath, "utf8");
  return JSON.parse(fileContents);
}

/**
 * @param {{
 *   environment: NodeJS.ProcessEnv;
 *   fileConfig: unknown;
 *   windowModeOverride: string | undefined;
 * }} input
 * @returns {"hidden" | "background" | "interactive"}
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
 * @param {{
 *   environment?: NodeJS.ProcessEnv;
 *   windowModeOverride?: string | undefined;
 *   configPath?: string | undefined;
 * }} [options]
 */
export function loadE2ERuntimeConfig(options = {}) {
  const {
    configPath = E2E_RUNTIME_CONFIG_PATH,
    environment = process.env,
    windowModeOverride,
  } = options;

  const fileConfig = readRuntimeConfigFile(configPath);

  return {
    windowMode: resolveConfiguredWindowMode({
      environment,
      fileConfig,
      windowModeOverride,
    }),
  };
}

export { DEFAULT_E2E_RUNTIME_CONFIG, E2E_RUNTIME_CONFIG_PATH, E2E_WINDOW_MODES };
