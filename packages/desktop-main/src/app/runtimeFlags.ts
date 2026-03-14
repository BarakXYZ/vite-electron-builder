const ENABLED_FLAG_VALUES = new Set(["1", "true", "yes", "on"]);

function isEnabledFlag(value: string | undefined): boolean {
  return value !== undefined && ENABLED_FLAG_VALUES.has(value.toLowerCase());
}

export function shouldOpenDevTools(environment: NodeJS.ProcessEnv = process.env): boolean {
  return isEnabledFlag(environment.APP_OPEN_DEVTOOLS);
}
