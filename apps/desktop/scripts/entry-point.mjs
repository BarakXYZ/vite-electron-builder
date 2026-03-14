import { bootstrapApp } from "@app/desktop-main";
import { fileURLToPath } from "node:url";

void bootstrapApp({
  env: process.env,
  initConfig: {
    renderer:
      process.env.MODE === "development" && !!process.env.VITE_DEV_SERVER_URL
        ? new URL(process.env.VITE_DEV_SERVER_URL)
        : {
            path: fileURLToPath(import.meta.resolve("@app/desktop-renderer")),
          },

    preload: {
      path: fileURLToPath(import.meta.resolve("@app/desktop-preload/exposed.mjs")),
    },
  },
});
