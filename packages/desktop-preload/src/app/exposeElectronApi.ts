import { contextBridge } from "electron";

import { electronApi, ELECTRON_API_KEY } from "./preloadApi.js";

export function exposeElectronApi(): void {
  if (process.contextIsolated) {
    contextBridge.exposeInMainWorld(ELECTRON_API_KEY, electronApi);
    return;
  }

  Object.defineProperty(globalThis, ELECTRON_API_KEY, {
    configurable: false,
    enumerable: false,
    value: electronApi,
    writable: false,
  });
}
