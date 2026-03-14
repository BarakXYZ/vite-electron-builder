import { defineE2ERuntimeConfig } from "./support/e2eRuntimeConfig.js";

export default defineE2ERuntimeConfig({
  // hidden: keep the Electron app window off-screen during E2E runs.
  // background: show the window without stealing OS focus.
  // interactive: show and focus the window normally for local debugging.
  windowMode: "background",
});
