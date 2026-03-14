import type { ReactNode } from "react";

import { ThemeProvider } from "@app/ui/components/theme-provider";

type AppProvidersProps = {
  readonly children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return <ThemeProvider defaultTheme="system">{children}</ThemeProvider>;
}
