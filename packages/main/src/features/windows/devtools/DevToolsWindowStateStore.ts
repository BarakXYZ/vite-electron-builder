import type { Rectangle } from "electron";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

type DevToolsWindowState = {
  readonly bounds: Rectangle;
  readonly isMaximized: boolean;
};

type RawState = {
  readonly bounds?: Partial<Rectangle>;
  readonly isMaximized?: unknown;
};

function asFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseRectangle(value: unknown): Rectangle | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const { height, width, x, y } = value as RawState["bounds"] & Record<string, unknown>;

  const parsedX = asFiniteNumber(x);
  const parsedY = asFiniteNumber(y);
  const parsedWidth = asFiniteNumber(width);
  const parsedHeight = asFiniteNumber(height);

  if (parsedX === null || parsedY === null || parsedWidth === null || parsedHeight === null) {
    return null;
  }

  return {
    height: parsedHeight,
    width: parsedWidth,
    x: parsedX,
    y: parsedY,
  };
}

function parseState(value: unknown): DevToolsWindowState | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const { bounds, isMaximized } = value as RawState;
  const parsedBounds = parseRectangle(bounds);

  if (parsedBounds === null || typeof isMaximized !== "boolean") {
    return null;
  }

  return {
    bounds: parsedBounds,
    isMaximized,
  };
}

export class DevToolsWindowStateStore {
  readonly #filePath: string;

  constructor(app: Electron.App) {
    this.#filePath = join(app.getPath("userData"), "window-state", "devtools.json");
  }

  load(): DevToolsWindowState | null {
    try {
      const state = JSON.parse(readFileSync(this.#filePath, "utf8")) as unknown;
      return parseState(state);
    } catch {
      return null;
    }
  }

  save(state: DevToolsWindowState): void {
    mkdirSync(dirname(this.#filePath), { recursive: true });
    writeFileSync(this.#filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  }
}

export type { DevToolsWindowState };
