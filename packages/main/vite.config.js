import { getNodeMajorVersion } from "@app/electron-versions";
import electronPath from "electron";
import { spawn } from "node:child_process";
import process from "node:process";

export default /**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
({
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

/**
 * Implement Electron app reload when some file was changed
 * @return {import('vite').Plugin}
 */
function handleHotReload() {
  /** @type {ChildProcess} */
  let electronApp = null;

  /** @type {import('vite').ViteDevServer|null} */
  let rendererWatchServer = null;

  return {
    config(config, env) {
      if (env.mode !== "development") {
        return;
      }

      const rendererWatchServerProvider = config.plugins.find(
        (p) => p.name === "@app/renderer-watch-server-provider",
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
    name: "@app/main-process-hot-reload",

    writeBundle() {
      if (process.env.NODE_ENV !== "development") {
        return;
      }

      /** Kill electron if a process already exists */
      if (electronApp !== null) {
        electronApp.removeListener("exit", process.exit);
        electronApp.kill("SIGINT");
        electronApp = null;
      }

      /** Spawn a new electron process */
      electronApp = spawn(String(electronPath), ["--inspect", "."], {
        stdio: "inherit",
      });

      /** Stops the watch script when the application has been quit */
      electronApp.addListener("exit", process.exit);
    },
  };
}
