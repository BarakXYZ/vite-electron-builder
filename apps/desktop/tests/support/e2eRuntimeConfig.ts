import { fileURLToPath, pathToFileURL } from "node:url";

export type E2EWindowMode = "hidden" | "background" | "interactive";

export type E2ERuntimeConfig = {
  readonly windowMode: E2EWindowMode;
};

type LoadE2ERuntimeConfigOptions = {
  readonly configPath?: string;
  readonly environment?: NodeJS.ProcessEnv;
  readonly windowModeOverride?: string;
};

type RuntimeConfigModule = {
  default: unknown;
};

export const DEFAULT_E2E_RUNTIME_CONFIG: E2ERuntimeConfig = {
  windowMode: "hidden",
};

export const E2E_WINDOW_MODES = ["hidden", "background", "interactive"] as const;
export const E2E_RUNTIME_CONFIG_PATH = fileURLToPath(
  new URL("../e2e.runtime.config.ts", import.meta.url),
);

const E2E_WINDOW_MODE_SET = new Set<E2EWindowMode>(E2E_WINDOW_MODES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isE2EWindowMode(value: unknown): value is E2EWindowMode {
  return typeof value === "string" && E2E_WINDOW_MODE_SET.has(value as E2EWindowMode);
}

function resolveConfiguredWindowMode({
  environment,
  fileConfig,
  windowModeOverride,
}: {
  environment: NodeJS.ProcessEnv;
  fileConfig: unknown;
  windowModeOverride: string | undefined;
}): E2EWindowMode {
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

export function defineE2ERuntimeConfig(config: E2ERuntimeConfig): E2ERuntimeConfig {
  return {
    windowMode: isE2EWindowMode(config.windowMode)
      ? config.windowMode
      : DEFAULT_E2E_RUNTIME_CONFIG.windowMode,
  };
}

export async function loadE2ERuntimeConfig(
  options: LoadE2ERuntimeConfigOptions = {},
): Promise<E2ERuntimeConfig> {
  const {
    configPath = E2E_RUNTIME_CONFIG_PATH,
    environment = process.env,
    windowModeOverride,
  } = options;

  const configUrl = pathToFileURL(configPath);
  const runtimeConfigModule = (await import(configUrl.href)) as RuntimeConfigModule;

  return {
    windowMode: resolveConfiguredWindowMode({
      environment,
      fileConfig: runtimeConfigModule.default,
      windowModeOverride,
    }),
  };
}
