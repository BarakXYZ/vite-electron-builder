import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const IGNORED_FILE_NAMES = new Set(["builder-debug.yml"]);
const [command, sourceDirectoryArg, targetDirectoryArg] = process.argv.slice(2);

if (!command || !sourceDirectoryArg) {
  throw new Error(
    "Usage: node release-assets.mjs <print|stage> <source-directory> [target-directory]",
  );
}

const sourceDirectoryPath = resolve(sourceDirectoryArg);

switch (command) {
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

  default:
    throw new Error(`Unsupported release-assets command: ${command}`);
}

function collectReleaseAssetPaths(sourceDirectoryPath) {
  return readdirSync(sourceDirectoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !IGNORED_FILE_NAMES.has(entry.name))
    .map((entry) => join(sourceDirectoryPath, entry.name))
    .sort((leftPath, rightPath) => leftPath.localeCompare(rightPath));
}

function stageReleaseAssets(sourceDirectoryPath, targetDirectoryPath) {
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
