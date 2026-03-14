import type { AppInitConfig } from "./AppInitConfig.js";

type RendererTarget = AppInitConfig["renderer"];

export function isRendererUrlTarget(rendererTarget: RendererTarget): rendererTarget is URL {
  return "href" in rendererTarget;
}
