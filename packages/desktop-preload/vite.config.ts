import { getChromeMajorVersion } from "@app/desktop-electron-versions";
import { resolveModuleExportNames } from "mlly";
import { defineConfig, type Plugin } from "vite";
import { writeBuildTaskState } from "../../apps/desktop/scripts/dev/buildTaskState.js";

const ELECTRON_API_KEY = "electronAPI";

function createBrowserExportStatement(key: string): string {
  const propertyAccessor = `globalThis[${JSON.stringify(ELECTRON_API_KEY)}][${JSON.stringify(key)}]`;

  return key === "default"
    ? `export default ${propertyAccessor};\n`
    : `export const ${key} = ${propertyAccessor};\n`;
}

function mockBrowserPreloadApi(): Plugin {
  const virtualModuleId = "virtual:browser.js";
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  return {
    async load(id) {
      if (id !== resolvedVirtualModuleId) {
        return null;
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

      return null;
    },
  };
}

function handleHotReload(): Plugin {
  let isDevelopment = false;

  return {
    config(_config, env) {
      if (env.mode !== "development") {
        return;
      }

      isDevelopment = true;
      return {
        build: {
          watch: {},
        },
      };
    },
    name: "@app/desktop-preload-process-hot-reload",
    async writeBundle() {
      if (!isDevelopment) {
        return;
      }

      await writeBuildTaskState("desktop-preload");
    },
  };
}

export default defineConfig({
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
