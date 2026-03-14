import { expect, test } from "../fixtures/electron";
import { getMainWindowState } from "../helpers/mainWindow";
import { getThemeSnapshot, RESOLVED_THEME_BACKGROUNDS } from "../helpers/theme";

test("main window resolves the configured theme project", async ({ page, themeSource }) => {
  const themeSnapshot = await getThemeSnapshot(page);

  expect(themeSnapshot.state.themeSource).toEqual(themeSource);
  expect(themeSnapshot.documentClassName).toContain(themeSnapshot.state.resolvedTheme);
  expect(themeSnapshot.mediaPrefersDark).toEqual(themeSnapshot.state.resolvedTheme === "dark");
  expect(themeSnapshot.mediaPrefersLight).toEqual(themeSnapshot.state.resolvedTheme === "light");

  if (themeSource === "system") {
    return;
  }

  expect(themeSnapshot.state.resolvedTheme).toEqual(themeSource);
});

test("main window boot background follows the resolved theme", async ({ electronApp, page }) => {
  const windowState = await getMainWindowState(electronApp, page);
  const themeSnapshot = await getThemeSnapshot(page);
  const expectedBackgrounds = RESOLVED_THEME_BACKGROUNDS[themeSnapshot.state.resolvedTheme];

  expect(themeSnapshot.documentBackgroundColor).toEqual(expectedBackgrounds.document);
  expect(windowState.backgroundColor).toEqual(expectedBackgrounds.nativeWindow);
});
