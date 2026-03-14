import { expect, test } from "../fixtures/electron.js";

test("main window has an interactive counter button", async ({ page }) => {
  const element = page.getByRole("button", { name: /count is \d+/ });
  await expect(element).toBeVisible();
  await expect(element).toHaveText("count is 0");
  await element.click();
  await expect(element).toHaveText("count is 1");
});

test("main window renders the app shell", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Electron Workspace" })).toBeVisible();
  await expect(page.getByRole("button", { name: "System" })).toBeVisible();
});
