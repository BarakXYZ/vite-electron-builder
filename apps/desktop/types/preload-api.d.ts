import type { ElectronApi } from "@app/desktop-preload";

declare global {
  interface Window {
    electronAPI: ElectronApi;
  }
}

export {};
