import { createHash } from "node:crypto";
import { expect, test } from "../fixtures/electron.js";

test.describe("preload context", () => {
  test("exposes a single explicit bridge object", async ({ page }) => {
    const type = await page.evaluate(() => typeof window.electronAPI);
    expect(type).toEqual("object");
  });

  test("exposes a theme bridge", async ({ page }) => {
    const type = await page.evaluate(() => typeof window.electronAPI.theme);
    expect(type).toEqual("object");
  });

  test.describe("versions", () => {
    test("exposes the versions object", async ({ page }) => {
      const type = await page.evaluate(() => typeof window.electronAPI.versions);
      expect(type).toEqual("object");
    });

    test("matches Electron runtime versions", async ({ electronVersions, page }) => {
      const value = await page.evaluate(() => window.electronAPI.versions);
      expect(value).toEqual(electronVersions);
    });
  });

  test.describe("sha256sum", () => {
    test("exposes the hashing function", async ({ page }) => {
      const type = await page.evaluate(() => typeof window.electronAPI.sha256sum);
      expect(type).toEqual("function");
    });

    test("matches the Node.js crypto implementation", async ({ page }) => {
      const testString = btoa(`${Date.now() * Math.random()}`);
      const expectedValue = createHash("sha256").update(testString).digest("hex");
      const value = await page.evaluate((str) => window.electronAPI.sha256sum(str), testString);
      expect(value).toEqual(expectedValue);
    });
  });
});
