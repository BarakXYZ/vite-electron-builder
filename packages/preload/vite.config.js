import { getChromeMajorVersion } from "@app/electron-versions";
import { resolveModuleExportNames } from "mlly";

const ELECTRON_API_KEY = "electronAPI";

export default /**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
({
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
          // ESM preload scripts must have the .mjs extension
          // https://www.electronjs.org/docs/latest/tutorial/esm#esm-preload-scripts-must-have-the-mjs-extension
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

/**
 * This plugin creates a browser (renderer) version of the preload package.
 * It maps the package exports to the single `window.electronAPI` bridge object
 * exposed by the real preload script.
 */
function mockBrowserPreloadApi() {
  const virtualModuleId = "virtual:browser.js";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

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
    name: "@app/preload-browser-api",
    resolveId(id) {
      if (id.endsWith(virtualModuleId)) {
        return resolvedVirtualModuleId;
      }
    },
  };
}

/**
 * Implement Electron webview reload when some file was changed
 * @return {import('vite').Plugin}
 */
function handleHotReload() {
  /** @type {import('vite').ViteDevServer|null} */
  let rendererWatchServer = null;

  return {
    config(config, env) {
      if (env.mode !== "development") {
        return;
      }

      const rendererWatchServerProvider = config.plugins.find(
        (plugin) => plugin.name === "@app/renderer-watch-server-provider",
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
    name: "@app/preload-process-hot-reload",
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
