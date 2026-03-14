import { spawn } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadE2ERuntimeConfig, type E2EWindowMode } from "../tests/support/e2eRuntimeConfig.js";

const VALID_WINDOW_MODES = new Set<E2EWindowMode>(["hidden", "background", "interactive"]);
const appRootPath = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));

type ParsedArguments = {
  playwrightArguments: Array<string>;
  windowModeOverride: E2EWindowMode | undefined;
};

function getPnpmCommand(): string {
  return process.platform === "win32" ? "pnpm.cmd" : "pnpm";
}

function parseArguments(argv: Array<string>): ParsedArguments {
  const playwrightArguments: Array<string> = [];
  let windowModeOverride: E2EWindowMode | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (!argument || argument === "--") {
      continue;
    }

    if (argument === "--window-mode") {
      const nextValue = argv[index + 1];
      if (!nextValue || !VALID_WINDOW_MODES.has(nextValue as E2EWindowMode)) {
        throw new TypeError(
          `Invalid --window-mode value: ${String(nextValue)}. Expected one of ${Array.from(VALID_WINDOW_MODES).join(", ")}.`,
        );
      }

      windowModeOverride = nextValue as E2EWindowMode;
      index += 1;
      continue;
    }

    playwrightArguments.push(argument);
  }

  return {
    playwrightArguments,
    windowModeOverride,
  };
}

function run(
  command: string,
  args: Array<string>,
  environment: NodeJS.ProcessEnv,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: appRootPath,
      env: environment,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Command exited with signal ${signal}`));
        return;
      }

      resolve(code ?? 1);
    });
  });
}

const { playwrightArguments, windowModeOverride } = parseArguments(process.argv.slice(2));
const pnpmCommand = getPnpmCommand();
const runtimeConfig = await loadE2ERuntimeConfig({
  environment: process.env,
  windowModeOverride,
});
const environment: NodeJS.ProcessEnv = {
  ...process.env,
  APP_E2E_WINDOW_MODE: runtimeConfig.windowMode,
};

const testExitCode = await run(
  pnpmCommand,
  ["exec", "playwright", "test", "--config", "./playwright.config.ts", ...playwrightArguments],
  environment,
);
process.exit(testExitCode);
