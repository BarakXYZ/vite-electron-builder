import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  setTheme: (theme: Theme) => void;
  theme: Theme;
};

const initialState: ThemeProviderState = {
  setTheme: () => null,
  theme: "system",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    return storedTheme ?? defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (nextTheme: Theme) => {
      root.classList.remove("light", "dark");
      root.classList.add(nextTheme === "system" ? getSystemTheme() : nextTheme);
    };

    applyTheme(theme);

    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = {
    setTheme: (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme);
      setTheme(nextTheme);
    },
    theme,
  };

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = () => {
  return useContext(ThemeProviderContext);
};
