import { app } from "electron";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import type { AppInitConfig } from "./AppInitConfig.js";
import { initApp } from "./initApp.js";

type BootstrapEnvironment = NodeJS.ProcessEnv;

function showUnhandledErrorAndExit(...args: Array<unknown>): never {
  process.stderr.write(`${args.map(String).join(" ")}\n`);
  process.exit(1);
}

function shouldExitOnUnhandledError(environment: BootstrapEnvironment): boolean {
  return (
    environment.NODE_ENV === "development" ||
    environment.PLAYWRIGHT_TEST === "true" ||
    Boolean(environment.CI)
  );
}

function installUnhandledErrorHandlers(environment: BootstrapEnvironment): void {
  if (!shouldExitOnUnhandledError(environment)) {
    return;
  }

  process.on("uncaughtException", showUnhandledErrorAndExit);
  process.on("unhandledRejection", showUnhandledErrorAndExit);
}

function ensureDirectory(path: string): string {
  const resolvedPath = resolve(path);
  mkdirSync(resolvedPath, { recursive: true });
  return resolvedPath;
}

function configureRuntimePaths(environment: BootstrapEnvironment): void {
  const userDataPath = environment.APP_USER_DATA_PATH;
  if (!userDataPath) {
    return;
  }

  const resolvedUserDataPath = ensureDirectory(userDataPath);
  const resolvedSessionDataPath = ensureDirectory(
    environment.APP_SESSION_DATA_PATH ?? `${resolvedUserDataPath}/session-data`,
  );
  const resolvedLogsPath = ensureDirectory(
    environment.APP_LOGS_PATH ?? `${resolvedUserDataPath}/logs`,
  );

  app.setPath("userData", resolvedUserDataPath);
  app.setPath("sessionData", resolvedSessionDataPath);
  app.setAppLogsPath(resolvedLogsPath);
}

export async function bootstrapApp({
  env = process.env,
  initConfig,
}: {
  env?: BootstrapEnvironment;
  initConfig: AppInitConfig;
}) {
  configureRuntimePaths(env);
  installUnhandledErrorHandlers(env);
  await initApp({ environment: env, initConfig });
}
