import { sha256sum } from "../features/crypto/sha256sum.js";
import { versions } from "../features/system/versions.js";
import { theme } from "../features/theme/theme.js";

const ELECTRON_API_KEY = "electronAPI";

const electronApi = Object.freeze({
  sha256sum,
  theme,
  versions,
});

export { electronApi, ELECTRON_API_KEY };
export type ElectronApi = typeof electronApi;
