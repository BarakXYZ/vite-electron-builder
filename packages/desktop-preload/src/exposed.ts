import { exposeElectronApi } from "./app/exposeElectronApi.js";

exposeElectronApi();

// Re-export for tests
export * from "./index.js";
