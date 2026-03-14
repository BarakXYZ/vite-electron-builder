export function emitDevSecurityWarning(message: string): void {
  if (import.meta.env.DEV) {
    process.emitWarning(message, {
      code: "APP_SECURITY",
    });
  }
}
