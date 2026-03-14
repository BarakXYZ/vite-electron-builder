import { readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";

const appRootPath = fileURLToPath(new URL("./", import.meta.url));
const workspaceRootPath = fileURLToPath(new URL("../../", import.meta.url));
const appPkg = readPackageJson(join(appRootPath, "package.json"));
const workspacePkg = readPackageJson(join(workspaceRootPath, "package.json"));
const workspacePackages = collectWorkspacePackages();
const runtimeWorkspacePackages = collectRuntimeWorkspacePackages(workspacePackages);

export default /** @type {import('electron-builder').Configuration} */ ({
  appId: "com.barakxyz.electronxyz.desktop",
  artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
  directories: {
    buildResources: "buildResources",
    output: "dist",
  },
  electronVersion: workspacePkg.devDependencies.electron,
  files: [
    {
      filter: ["LICENSE*"],
      from: relative(appRootPath, workspaceRootPath),
      to: ".",
    },
    {
      filter: normalizeFilePatterns([appPkg.main, "package.json"]),
      from: ".",
      to: ".",
    },
    ...runtimeWorkspacePackages.map(createWorkspaceFileSet),
  ],
  generateUpdatesFilesForAllChannels: true,
  linux: {
    target: ["deb"],
  },
  productName: "ElectronXYZ",
});

function createWorkspaceFileSet(workspacePackage) {
  return {
    filter: normalizeFilePatterns([
      "package.json",
      ...(workspacePackage.manifest.files ?? ["dist/**"]),
    ]),
    from: relative(appRootPath, workspacePackage.rootPath),
    to: join("node_modules", workspacePackage.manifest.name),
  };
}

function collectWorkspacePackages() {
  const workspacePackages = new Map();
  for (const workspacePattern of getWorkspacePatterns()) {
    const packageJsonPaths = globSync(join(workspacePattern, "package.json"), {
      absolute: true,
      cwd: workspaceRootPath,
      ignore: ["**/node_modules/**"],
    });

    for (const packageJsonPath of packageJsonPaths) {
      const workspacePackage = readPackageJson(packageJsonPath);
      if (typeof workspacePackage.name !== "string") {
        continue;
      }

      workspacePackages.set(workspacePackage.name, {
        manifest: workspacePackage,
        rootPath: dirname(packageJsonPath),
      });
    }
  }

  return workspacePackages;
}

function collectRuntimeWorkspacePackages(workspacePackages) {
  const pending = Object.entries(appPkg.dependencies ?? {})
    .filter(([, version]) => typeof version === "string" && version.startsWith("workspace:"))
    .map(([dependencyName]) => dependencyName);
  const included = new Map();

  while (pending.length > 0) {
    const dependencyName = pending.pop();
    if (!dependencyName || included.has(dependencyName)) {
      continue;
    }

    const workspacePackage = workspacePackages.get(dependencyName);
    if (!workspacePackage) {
      continue;
    }

    included.set(dependencyName, workspacePackage);

    const runtimeDependencies = {
      ...workspacePackage.manifest.dependencies,
      ...workspacePackage.manifest.optionalDependencies,
    };

    for (const nestedDependencyName of Object.keys(runtimeDependencies)) {
      if (workspacePackages.has(nestedDependencyName)) {
        pending.push(nestedDependencyName);
      }
    }
  }

  return [...included.values()];
}

function readPackageJson(packageJsonPath) {
  return JSON.parse(readFileSync(packageJsonPath, "utf8"));
}

function getWorkspacePatterns() {
  const patterns = workspacePkg.workspaces;

  if (!Array.isArray(patterns) || patterns.length === 0) {
    throw new Error("Root package.json must declare workspace patterns for desktop packaging.");
  }

  return patterns;
}

function normalizeFilePatterns(patterns) {
  return [...new Set(patterns.map((pattern) => pattern.replace(/^\.\//u, "")))];
}
