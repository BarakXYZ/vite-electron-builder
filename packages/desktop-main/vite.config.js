import { getNodeMajorVersion } from "@app/desktop-electron-versions";
import { writeBuildTaskState } from "../../apps/desktop/scripts/dev/buildTaskState.js";
import { waitForRendererDevServerUrl } from "../../apps/desktop/scripts/dev/rendererDevServerState.js";
import process from "node:process";

export default /** @type {import('vite').UserConfig} */ ({
  build: {
    assetsDir: ".",
    emptyOutDir: true,
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
    },
    outDir: "dist",
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
      },
    },
    sourcemap: "inline",
    ssr: true,
    target: `node${getNodeMajorVersion()}`,
  },
  plugins: [handleHotReload()],
});

function handleHotReload() {
  let isDevelopment = false;

  return {
    async config(_config, env) {
      if (env.mode !== "development") {
        return;
      }

      isDevelopment = true;
      process.env.VITE_DEV_SERVER_URL = await waitForRendererDevServerUrl();

      return {
        build: {
          watch: {},
        },
      };
    },
    name: "@app/desktop-main-process-hot-reload",
    async writeBundle() {
      if (!isDevelopment) {
        return;
      }

      await writeBuildTaskState("desktop-main");
    },
  };
}
