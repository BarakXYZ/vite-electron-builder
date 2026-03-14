import type { ReactNode } from "react";

import { ThemeProvider } from "@app/ui/components/theme-provider";
import { electronThemeController } from "../features/theme/electronThemeController.js";

type AppProvidersProps = {
  readonly children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" themeController={electronThemeController}>
      {children}
    </ThemeProvider>
  );
}
