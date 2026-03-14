import { sha256sum } from "../features/crypto/sha256sum.js";
import { versions } from "../features/system/versions.js";

const ELECTRON_API_KEY = "electronAPI";

const electronApi = Object.freeze({
  sha256sum,
  versions,
});

export { electronApi, ELECTRON_API_KEY };
export type ElectronApi = typeof electronApi;
