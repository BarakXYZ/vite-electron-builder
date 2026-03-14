import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const rendererPackageJsonPath = fileURLToPath(
  new URL("../desktop-renderer/package.json", import.meta.url),
);
const pkgJson = JSON.parse(readFileSync(rendererPackageJsonPath, "utf8")) as {
  exports?: Record<string, unknown>;
  main?: string;
  name?: string;
  scripts?: {
    build?: string;
  };
};
const step = createStepLogger();

await step('Changing renderer package name to "@app/desktop-renderer"', changeRendererPackageName);
await step("Ensure vite build uses the desktop file base", addTheBaseFlagToBuildCommand);
await step('Ensure the desktop renderer exports "./dist/index.html"', addTheMainProperty);

function changeRendererPackageName(): void {
  if (pkgJson.name === "@app/desktop-renderer") {
    return;
  }

  pkgJson.name = "@app/desktop-renderer";
  savePkg();
}

function addTheBaseFlagToBuildCommand(): false | void {
  if (!pkgJson.scripts?.build) {
    writeInfo("No build script found. Skip.");
    return false;
  }

  if (!pkgJson.scripts.build.includes("vite build")) {
    writeInfo(
      'The build script exists, but it was not recognized as a "vite build" command. Skip.',
    );
    return false;
  }

  if (pkgJson.scripts.build.includes("--base")) {
    writeInfo('The "--base" flag already exists. Skip.');
    return false;
  }

  pkgJson.scripts.build = pkgJson.scripts.build.replaceAll("vite build", "vite build --base ./");
  savePkg();
}

function addTheMainProperty(): false | void {
  if (pkgJson.main) {
    writeInfo('The "main" property already exists. Skip.');
    return false;
  }

  pkgJson.main = "./dist/index.html";
  pkgJson.exports = { ...(pkgJson.exports ?? {}), ".": { default: pkgJson.main } };
  savePkg();
}

function createStepLogger() {
  writeInfo("\n\n\n\n----------");
  writeInfo("Default Vite project has been created.");
  writeInfo("Applying the desktop renderer compatibility steps now.");
  writeInfo("All changes are detailed below.\n");

  let stepNumber = 1;

  return async function logStep(
    message: string,
    callback: () => false | void | Promise<false | void>,
  ) {
    writeInfo(`${stepNumber++}. ${message}\n`);

    try {
      await callback();
    } catch (error) {
      const errorMessage = error instanceof Error ? (error.stack ?? error.message) : String(error);
      process.stderr.write(`${errorMessage}\n`);
      process.exit(1);
    }
  };
}

function savePkg(): void {
  writeFileSync(rendererPackageJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`, {
    encoding: "utf8",
  });
}

function writeInfo(message: string): void {
  process.stdout.write(`${message}\n`);
}
