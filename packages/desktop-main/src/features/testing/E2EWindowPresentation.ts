import type { BrowserWindow } from "electron";

const E2E_WINDOW_PRESENTATION_MODES = ["hidden", "background", "interactive"] as const;
const TRUE_LIKE_VALUES = new Set(["1", "true", "yes", "on"]);

export type E2EWindowPresentationMode = (typeof E2E_WINDOW_PRESENTATION_MODES)[number];

function isTruthy(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return TRUE_LIKE_VALUES.has(value.trim().toLowerCase());
}

function isE2EWindowPresentationMode(
  value: string | undefined,
): value is E2EWindowPresentationMode {
  return (
    typeof value === "string" &&
    E2E_WINDOW_PRESENTATION_MODES.includes(value as E2EWindowPresentationMode)
  );
}

export function isE2ERuntime(environment: NodeJS.ProcessEnv = process.env): boolean {
  return (
    environment.PLAYWRIGHT_TEST === "true" ||
    environment.CI === "e2e" ||
    isTruthy(environment.ELECTRON_IS_E2E)
  );
}

export function resolveE2EWindowPresentationMode(
  environment: NodeJS.ProcessEnv = process.env,
): E2EWindowPresentationMode {
  if (!isE2ERuntime(environment)) {
    return "interactive";
  }

  const configuredMode = environment.APP_E2E_WINDOW_MODE;
  return isE2EWindowPresentationMode(configuredMode) ? configuredMode : "hidden";
}

export function presentWindow(
  browserWindow: BrowserWindow,
  environment: NodeJS.ProcessEnv = process.env,
): void {
  const presentationMode = resolveE2EWindowPresentationMode(environment);

  if (presentationMode === "hidden") {
    return;
  }

  if (presentationMode === "background") {
    browserWindow.showInactive();
    return;
  }

  browserWindow.show();
}

export function focusWindowIfInteractive(
  browserWindow: BrowserWindow,
  environment: NodeJS.ProcessEnv = process.env,
): void {
  if (resolveE2EWindowPresentationMode(environment) !== "interactive") {
    return;
  }

  browserWindow.focus();
}
