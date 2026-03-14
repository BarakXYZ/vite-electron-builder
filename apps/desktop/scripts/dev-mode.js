import { build, createServer } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const mode = "development";
const appRootPath = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const workspaceRootPath = resolve(appRootPath, "../..");
const rendererPackagePath = resolve(workspaceRootPath, "packages/desktop-renderer");
const mainPackagePath = resolve(workspaceRootPath, "packages/desktop-main");
const preloadPackagePath = resolve(workspaceRootPath, "packages/desktop-preload");

process.env.NODE_ENV = mode;
process.env.MODE = mode;

const rendererWatchServer = await createServer({
  mode,
  root: rendererPackagePath,
});

await rendererWatchServer.listen();

const rendererWatchServerProvider = {
  api: {
    provideRendererWatchServer() {
      return rendererWatchServer;
    },
  },
  name: "@app/desktop-renderer-watch-server-provider",
};

for (const packagePath of [preloadPackagePath, mainPackagePath]) {
  await build({
    mode,
    plugins: [rendererWatchServerProvider],
    root: packagePath,
  });
}
