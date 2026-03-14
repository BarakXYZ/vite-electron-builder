import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type ElectronAppProfile = {
  cleanup: () => Promise<void>;
  logsPath: string;
  rootPath: string;
  sessionDataPath: string;
};

export async function createElectronAppProfile(workerIndex: number): Promise<ElectronAppProfile> {
  const rootPath = await mkdtemp(join(tmpdir(), `electron-xyz-playwright-${workerIndex}-`));
  const sessionDataPath = join(rootPath, "session-data");
  const logsPath = join(rootPath, "logs");

  return {
    cleanup: async () => {
      await rm(rootPath, {
        force: true,
        maxRetries: 5,
        recursive: true,
        retryDelay: 100,
      });
    },
    logsPath,
    rootPath,
    sessionDataPath,
  };
}
