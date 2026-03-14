export type E2EWindowMode = "hidden" | "background" | "interactive";

export type E2ERuntimeConfig = {
  readonly windowMode: E2EWindowMode;
};

export declare const DEFAULT_E2E_RUNTIME_CONFIG: E2ERuntimeConfig;
export declare const E2E_RUNTIME_CONFIG_PATH: string;
export declare const E2E_WINDOW_MODES: ReadonlyArray<E2EWindowMode>;

export declare function defineE2ERuntimeConfig(config: E2ERuntimeConfig): E2ERuntimeConfig;

export declare function loadE2ERuntimeConfig(options?: {
  readonly configPath?: string;
  readonly environment?: NodeJS.ProcessEnv;
  readonly windowModeOverride?: string;
}): Promise<E2ERuntimeConfig>;
