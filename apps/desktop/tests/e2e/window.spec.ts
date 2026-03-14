import { expect, test } from "../fixtures/electron";
import { getMainWindowState } from "../helpers/mainWindow";

test("main window is healthy on boot", async ({ electronApp, page, windowMode }) => {
  const windowState = await getMainWindowState(electronApp, page);

  expect(windowState.isCrashed, "The app has crashed").toEqual(false);
  expect(windowState.isVisible, "The main window visibility did not match the active mode").toEqual(
    windowMode !== "hidden",
  );
  expect(windowState.isDevToolsOpened, "The DevTools panel was open").toEqual(false);
});
