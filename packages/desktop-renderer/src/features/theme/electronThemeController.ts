import type {
  ThemeController,
  ThemeState as ProviderThemeState,
} from "@app/ui/components/theme-provider";
import type { ThemeState as ElectronThemeState } from "@app/desktop-preload";

function toProviderState(state: ElectronThemeState): ProviderThemeState {
  return {
    resolvedTheme: state.resolvedTheme,
    theme: state.themeSource,
  };
}

export const electronThemeController: ThemeController = {
  async getState() {
    return toProviderState(await window.electronAPI.theme.getState());
  },
  async setTheme(theme) {
    return toProviderState(await window.electronAPI.theme.setThemeSource(theme));
  },
  subscribe(listener) {
    return window.electronAPI.theme.subscribe((state: ElectronThemeState) => {
      listener(toProviderState(state));
    });
  },
};
