import { nativeTheme } from "electron";
import { EventEmitter } from "node:events";
import {
  isThemeSource,
  type ResolvedTheme,
  type ThemeSource,
  type ThemeState,
} from "./ThemeState.js";

const THEME_CHANGED_EVENT = "theme-changed";

function resolveTheme(): ResolvedTheme {
  return nativeTheme.shouldUseDarkColors ? "dark" : "light";
}

function parseThemeSourceOverride(environment: NodeJS.ProcessEnv): ThemeSource | null {
  const override = environment.APP_THEME_SOURCE;
  return isThemeSource(override) ? override : null;
}

type ThemeServiceEvents = {
  emit(eventName: typeof THEME_CHANGED_EVENT, state: ThemeState): boolean;
  on(
    eventName: typeof THEME_CHANGED_EVENT,
    listener: (state: ThemeState) => void,
  ): ThemeServiceEvents;
};

export class ThemeService {
  readonly #events: ThemeServiceEvents;
  readonly #preferenceStore;
  readonly #themeSourceOverride;
  #resolvedTheme: ResolvedTheme;
  #themeSource: ThemeSource;

  constructor({
    environment = process.env,
    preferenceStore,
  }: {
    environment?: NodeJS.ProcessEnv;
    preferenceStore: { load: () => ThemeSource | null; save: (themeSource: ThemeSource) => void };
  }) {
    this.#events = new EventEmitter();
    this.#preferenceStore = preferenceStore;
    this.#themeSourceOverride = parseThemeSourceOverride(environment);
    this.#resolvedTheme = "light";
    this.#themeSource = "system";
  }

  initialize(): ThemeState {
    const initialThemeSource =
      this.#themeSourceOverride ?? this.#preferenceStore.load() ?? "system";
    const persist = this.#themeSourceOverride === null;
    return this.#applyThemeSource(initialThemeSource, { persist });
  }

  getState(): ThemeState {
    return {
      resolvedTheme: this.#resolvedTheme,
      themeSource: this.#themeSource,
    };
  }

  onDidChange(listener: (state: ThemeState) => void): void {
    this.#events.on(THEME_CHANGED_EVENT, listener);
  }

  setThemeSource(themeSource: ThemeSource): ThemeState {
    return this.#applyThemeSource(themeSource, { persist: true });
  }

  syncResolvedTheme(): ThemeState {
    const nextResolvedTheme = resolveTheme();
    if (nextResolvedTheme === this.#resolvedTheme) {
      return this.getState();
    }

    this.#resolvedTheme = nextResolvedTheme;
    const state = this.getState();
    this.#events.emit(THEME_CHANGED_EVENT, state);
    return state;
  }

  #applyThemeSource(themeSource: ThemeSource, { persist }: { persist: boolean }): ThemeState {
    this.#themeSource = themeSource;
    nativeTheme.themeSource = themeSource;
    this.#resolvedTheme = resolveTheme();

    if (persist) {
      this.#preferenceStore.save(themeSource);
    }

    const state = this.getState();
    this.#events.emit(THEME_CHANGED_EVENT, state);
    return state;
  }
}
