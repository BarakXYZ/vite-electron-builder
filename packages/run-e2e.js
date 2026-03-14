import { spawn } from "node:child_process";
import { loadE2ERuntimeConfig } from "../tests/support/e2eRuntimeConfig.js";

const VALID_WINDOW_MODES = new Set(["hidden", "background", "interactive"]);

function getPnpmCommand() {
  return process.platform === "win32" ? "pnpm.cmd" : "pnpm";
}

function parseArguments(argv) {
  const playwrightArguments = [];
  let windowModeOverride;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--") {
      continue;
    }

    if (argument === "--window-mode") {
      const nextValue = argv[index + 1];
      if (!VALID_WINDOW_MODES.has(nextValue)) {
        throw new TypeError(
          `Invalid --window-mode value: ${String(nextValue)}. Expected one of ${Array.from(VALID_WINDOW_MODES).join(", ")}.`,
        );
      }

      windowModeOverride = nextValue;
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

function run(command, args, environment) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
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
const runtimeConfig = loadE2ERuntimeConfig({
  environment: process.env,
  windowModeOverride,
});
const environment = {
  ...process.env,
  APP_E2E_WINDOW_MODE: runtimeConfig.windowMode,
};

const buildExitCode = await run(pnpmCommand, ["run", "build"], environment);
if (buildExitCode !== 0) {
  process.exit(buildExitCode);
}

const testExitCode = await run(
  pnpmCommand,
  ["exec", "playwright", "test", ...playwrightArguments],
  environment,
);
process.exit(testExitCode);
