import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  clearRendererDevServerUrl,
  writeRendererDevServerUrl,
} from "../../apps/desktop/scripts/dev/rendererDevServerState.js";
import { defineConfig } from "vite";

const configDirectoryPath = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss(), persistRendererDevServerState()],
  resolve: {
    alias: {
      "@": path.resolve(configDirectoryPath, "./src"),
    },
  },
  server: {
    host: "127.0.0.1",
  },
});

function persistRendererDevServerState() {
  return {
    configureServer(server: import("vite").ViteDevServer) {
      const persistResolvedUrl = async () => {
        const resolvedUrl = server.resolvedUrls?.local[0];
        if (!resolvedUrl) {
          return;
        }

        await writeRendererDevServerUrl(resolvedUrl);
      };

      const httpServer = server.httpServer;
      if (!httpServer) {
        return;
      }

      if (httpServer.listening) {
        void persistResolvedUrl();
      } else {
        httpServer.once("listening", () => {
          void persistResolvedUrl();
        });
      }

      httpServer.once("close", () => {
        void clearRendererDevServerUrl();
      });
    },
    name: "@app/desktop-renderer-dev-server-state",
  };
}
