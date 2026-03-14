import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = Exclude<Theme, "system">;

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  themeController?: ThemeController;
};

type ThemeState = {
  resolvedTheme: ResolvedTheme;
  theme: Theme;
};

type ThemeController = {
  getState: () => Promise<ThemeState> | ThemeState;
  setTheme: (theme: Theme) => Promise<ThemeState> | ThemeState | void;
  subscribe?: (listener: (state: ThemeState) => void) => (() => void) | void;
};

type ThemeProviderState = ThemeState & {
  isLoaded: boolean;
  setTheme: (theme: Theme) => Promise<void>;
};

const initialState: ThemeProviderState = {
  isLoaded: false,
  resolvedTheme: "light",
  setTheme: async () => undefined,
  theme: "system",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

function loadStoredTheme(defaultTheme: Theme): Theme {
  const storedTheme = localStorage.getItem("vite-ui-theme");
  return storedTheme === "dark" || storedTheme === "light" || storedTheme === "system"
    ? storedTheme
    : defaultTheme;
}

function loadLocalThemeState(defaultTheme: Theme): ThemeState {
  const theme = loadStoredTheme(defaultTheme);
  return {
    resolvedTheme: resolveTheme(theme),
    theme,
  };
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  themeController,
}: ThemeProviderProps) {
  const [state, setState] = useState<ThemeProviderState>(() => {
    const initialThemeState =
      themeController === undefined
        ? loadLocalThemeState(defaultTheme)
        : {
            resolvedTheme: resolveTheme(defaultTheme),
            theme: defaultTheme,
          };

    return {
      ...initialThemeState,
      isLoaded: themeController === undefined,
      setTheme: initialState.setTheme,
    };
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(state.resolvedTheme);
  }, [state.resolvedTheme]);

  useEffect(() => {
    if (!themeController) {
      return;
    }

    let isCancelled = false;

    Promise.resolve(themeController.getState())
      .then((nextState) => {
        if (isCancelled) {
          return;
        }

        setState((currentState) => ({
          ...currentState,
          ...nextState,
          isLoaded: true,
        }));
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }

        setState((currentState) => ({
          ...currentState,
          isLoaded: true,
        }));
      });

    const unsubscribe = themeController.subscribe?.((nextState) => {
      setState((currentState) => ({
        ...currentState,
        ...nextState,
        isLoaded: true,
      }));
    });

    return () => {
      isCancelled = true;
      unsubscribe?.();
    };
  }, [themeController]);

  useEffect(() => {
    if (themeController || state.theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setState((currentState) => ({
        ...currentState,
        resolvedTheme: getSystemTheme(),
      }));
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [state.theme, themeController]);

  const value = useMemo<ThemeProviderState>(() => {
    return {
      isLoaded: state.isLoaded,
      resolvedTheme: state.resolvedTheme,
      setTheme: async (nextTheme: Theme) => {
        if (themeController) {
          const nextState = await themeController.setTheme(nextTheme);
          if (!nextState) {
            return;
          }

          setState((currentState) => ({
            ...currentState,
            ...nextState,
            isLoaded: true,
          }));

          return;
        }

        localStorage.setItem("vite-ui-theme", nextTheme);
        setState((currentState) => ({
          ...currentState,
          resolvedTheme: resolveTheme(nextTheme),
          theme: nextTheme,
        }));
      },
      theme: state.theme,
    };
  }, [state, themeController]);

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = () => {
  return useContext(ThemeProviderContext);
};

export type { ResolvedTheme, Theme, ThemeController, ThemeState };
