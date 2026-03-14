import { getNodeMajorVersion } from "@app/desktop-electron-versions";
import electronPath from "electron";
import { spawn } from "node:child_process";
import { URL, fileURLToPath } from "node:url";
import process from "node:process";

const desktopAppRootPath = fileURLToPath(new URL("../../apps/desktop", import.meta.url));

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
  let electronApp = null;
  let rendererWatchServer = null;

  return {
    config(config, env) {
      if (env.mode !== "development") {
        return;
      }

      const rendererWatchServerProvider = config.plugins.find(
        (plugin) => plugin.name === "@app/desktop-renderer-watch-server-provider",
      );
      if (!rendererWatchServerProvider) {
        throw new Error("Renderer watch server provider not found");
      }

      rendererWatchServer = rendererWatchServerProvider.api.provideRendererWatchServer();
      process.env.VITE_DEV_SERVER_URL = rendererWatchServer.resolvedUrls.local[0];

      return {
        build: {
          watch: {},
        },
      };
    },
    name: "@app/desktop-main-process-hot-reload",
    writeBundle() {
      if (process.env.NODE_ENV !== "development") {
        return;
      }

      if (electronApp !== null) {
        electronApp.removeListener("exit", process.exit);
        electronApp.kill("SIGINT");
        electronApp = null;
      }

      electronApp = spawn(String(electronPath), ["--inspect", desktopAppRootPath], {
        stdio: "inherit",
      });
      electronApp.addListener("exit", process.exit);
    },
  };
}
