export declare const appRootPath: string;
export declare const stateDirectoryPath: string;
export declare const stateFilePath: string;
export declare function clearRendererDevServerUrl(): Promise<void>;
export declare function loadRendererDevServerUrl(): Promise<string | null>;
export declare function waitForRendererDevServerUrl(options?: {
  pollIntervalMs?: number;
  timeoutMs?: number;
}): Promise<string>;
export declare function writeRendererDevServerUrl(url: string): Promise<void>;
