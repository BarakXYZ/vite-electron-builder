import { defineConfig } from "@playwright/test";
import process from "node:process";

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  testDir: "./tests",
  testMatch: "e2e.spec.ts",
  workers: 1,
});
