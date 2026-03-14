import type { ElectronApi } from "@app/preload";

declare global {
  interface Window {
    electronAPI: ElectronApi;
  }
}

export {};
