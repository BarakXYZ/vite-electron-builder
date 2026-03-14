import type { AppModule } from "../../app/AppModule.js";
import electronUpdater, { type AppUpdater, type Logger } from "electron-updater";

type DownloadNotification = Parameters<AppUpdater["checkForUpdatesAndNotify"]>[0];

function hasErrorMessage(error: unknown): error is { readonly message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  );
}

export class AutoUpdater implements AppModule {
  readonly #logger: Logger | null;
  readonly #notification: DownloadNotification;

  constructor({
    downloadNotification = undefined,
    logger = null,
  }: {
    downloadNotification?: DownloadNotification;
    logger?: Logger | null | undefined;
  } = {}) {
    this.#logger = logger;
    this.#notification = downloadNotification;
  }

  async enable(): Promise<void> {
    await this.runAutoUpdater();
  }

  getAutoUpdater(): AppUpdater {
    // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
    // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
    const { autoUpdater } = electronUpdater;
    return autoUpdater;
  }

  async runAutoUpdater() {
    const updater = this.getAutoUpdater();
    try {
      updater.logger = this.#logger || null;
      updater.fullChangelog = true;

      if (import.meta.env.VITE_DISTRIBUTION_CHANNEL) {
        updater.channel = import.meta.env.VITE_DISTRIBUTION_CHANNEL;
      }

      return await updater.checkForUpdatesAndNotify(this.#notification);
    } catch (error) {
      if (hasErrorMessage(error) && error.message.includes("No published versions")) {
        return null;
      }

      throw error;
    }
  }
}

export function autoUpdater(...args: ConstructorParameters<typeof AutoUpdater>) {
  return new AutoUpdater(...args);
}
