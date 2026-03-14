import { execSync } from "node:child_process";

let inMemoryCache: NodeJS.ProcessVersions | null = null;

function getElectronEnv(): NodeJS.ProcessVersions {
  return JSON.parse(
    execSync('npx electron -p "JSON.stringify(process.versions)"', {
      encoding: "utf8",
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
      },
    }),
  ) as NodeJS.ProcessVersions;
}

function loadElectronEnv(): NodeJS.ProcessVersions {
  if (inMemoryCache !== null) {
    return inMemoryCache;
  }

  inMemoryCache = getElectronEnv();
  return inMemoryCache;
}

export function getElectronVersions(): NodeJS.ProcessVersions {
  return loadElectronEnv();
}

export function getChromeVersion(): string {
  return getElectronVersions().chrome ?? "0";
}

export function getChromeMajorVersion(): number {
  return getMajorVersion(getChromeVersion());
}

export function getNodeVersion(): string {
  return getElectronVersions().node ?? process.version;
}

export function getNodeMajorVersion(): number {
  return getMajorVersion(getNodeVersion());
}

function getMajorVersion(version: string): number {
  return Number.parseInt(version.split(".")[0] ?? "0", 10);
}
