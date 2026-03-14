import { getChromeMajorVersion } from "@app/desktop-electron-versions";
import { resolveModuleExportNames } from "mlly";

const ELECTRON_API_KEY = "electronAPI";

export default /** @type {import('vite').UserConfig} */ ({
  build: {
    assetsDir: ".",
    emptyOutDir: true,
    lib: {
      entry: ["src/exposed.ts", "virtual:browser.js"],
    },
    outDir: "dist",
    reportCompressedSize: false,
    rollupOptions: {
      output: [
        {
          entryFileNames: "[name].mjs",
        },
      ],
    },
    sourcemap: "inline",
    ssr: true,
    target: `chrome${getChromeMajorVersion()}`,
  },
  plugins: [mockBrowserPreloadApi(), handleHotReload()],
});

function createBrowserExportStatement(key) {
  const propertyAccessor = `globalThis[${JSON.stringify(ELECTRON_API_KEY)}][${JSON.stringify(key)}]`;

  return key === "default"
    ? `export default ${propertyAccessor};\n`
    : `export const ${key} = ${propertyAccessor};\n`;
}

function mockBrowserPreloadApi() {
  const virtualModuleId = "virtual:browser.js";
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  return {
    async load(id) {
      if (id !== resolvedVirtualModuleId) {
        return;
      }

      const exportedNames = await resolveModuleExportNames("./src/index.ts", {
        url: import.meta.url,
      });

      return exportedNames.reduce((source, key) => source + createBrowserExportStatement(key), "");
    },
    name: "@app/desktop-preload-browser-api",
    resolveId(id) {
      if (id.endsWith(virtualModuleId)) {
        return resolvedVirtualModuleId;
      }
    },
  };
}

function handleHotReload() {
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

      return {
        build: {
          watch: {},
        },
      };
    },
    name: "@app/desktop-preload-process-hot-reload",
    writeBundle() {
      if (!rendererWatchServer) {
        return;
      }

      rendererWatchServer.ws.send({
        type: "full-reload",
      });
    },
  };
}
