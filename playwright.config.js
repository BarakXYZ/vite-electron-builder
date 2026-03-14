import { defineConfig } from "@playwright/test";
import process from "node:process";

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  projects: [
    {
      name: "electron-light",
      use: {
        colorScheme: "light",
      },
    },
    {
      name: "electron-dark",
      use: {
        colorScheme: "dark",
      },
    },
    {
      name: "electron-system",
      use: {
        colorScheme: null,
      },
    },
  ],
  testDir: "./tests",
  testMatch: "e2e.spec.ts",
  workers: 1,
});
