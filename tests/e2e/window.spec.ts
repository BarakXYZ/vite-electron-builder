import { expect, test } from "../fixtures/electron";
import { getMainWindowState } from "../helpers/mainWindow";

test("main window is healthy on boot", async ({ electronApp, page }) => {
  const windowState = await getMainWindowState(electronApp, page);

  expect(windowState.isCrashed, "The app has crashed").toEqual(false);
  expect(windowState.isVisible, "The main window was not visible").toEqual(true);
  expect(windowState.isDevToolsOpened, "The DevTools panel was open").toEqual(false);
});
