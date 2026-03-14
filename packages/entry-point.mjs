import { bootstrapApp } from "@app/main";
import { fileURLToPath } from "node:url";

/**
 * We resolve '@app/renderer' and '@app/preload'
 * here and not in '@app/main'
 * to observe good practices of modular design.
 * This allows fewer dependencies and better separation of concerns in '@app/main'.
 * Thus,
 * the main module remains simplistic and efficient
 * as it receives initialization instructions rather than direct module imports.
 */
void bootstrapApp({
  env: process.env,
  initConfig: {
    renderer:
      process.env.MODE === "development" && !!process.env.VITE_DEV_SERVER_URL
        ? new URL(process.env.VITE_DEV_SERVER_URL)
        : {
            path: fileURLToPath(import.meta.resolve("@app/renderer")),
          },

    preload: {
      path: fileURLToPath(import.meta.resolve("@app/preload/exposed.mjs")),
    },
  },
});
