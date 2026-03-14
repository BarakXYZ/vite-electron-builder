import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const IGNORED_FILE_NAMES = new Set(["builder-debug.yml"]);
const [command, sourceDirectoryArg, targetDirectoryArg] = process.argv.slice(2);

type ReleaseAssetsCommand = "print" | "stage";

if (!command || !sourceDirectoryArg) {
  throw new Error(
    "Usage: tsx release-assets.ts <print|stage> <source-directory> [target-directory]",
  );
}

const sourceDirectoryPath = resolve(sourceDirectoryArg);

if (command !== "print" && command !== "stage") {
  throw new Error(`Unsupported release-assets command: ${command}`);
}

const releaseAssetsCommand: ReleaseAssetsCommand = command;

switch (releaseAssetsCommand) {
  case "print": {
    for (const releaseAssetPath of collectReleaseAssetPaths(sourceDirectoryPath)) {
      process.stdout.write(`${releaseAssetPath}\n`);
    }

    break;
  }

  case "stage": {
    if (!targetDirectoryArg) {
      throw new Error("The stage command requires a target directory.");
    }

    const targetDirectoryPath = resolve(targetDirectoryArg);
    stageReleaseAssets(sourceDirectoryPath, targetDirectoryPath);
    break;
  }
}

function collectReleaseAssetPaths(sourceDirectoryPath: string): Array<string> {
  return readdirSync(sourceDirectoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !IGNORED_FILE_NAMES.has(entry.name))
    .map((entry) => join(sourceDirectoryPath, entry.name))
    .sort((leftPath, rightPath) => leftPath.localeCompare(rightPath));
}

function stageReleaseAssets(sourceDirectoryPath: string, targetDirectoryPath: string): void {
  const releaseAssetPaths = collectReleaseAssetPaths(sourceDirectoryPath);
  if (releaseAssetPaths.length === 0) {
    throw new Error(`No release assets were found in ${sourceDirectoryPath}.`);
  }

  rmSync(targetDirectoryPath, { force: true, recursive: true });
  mkdirSync(targetDirectoryPath, { recursive: true });

  for (const releaseAssetPath of releaseAssetPaths) {
    cpSync(releaseAssetPath, join(targetDirectoryPath, basename(releaseAssetPath)));
  }
}
