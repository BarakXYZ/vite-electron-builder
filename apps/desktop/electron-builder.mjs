import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const appRootPath = fileURLToPath(new URL("./", import.meta.url));
const workspaceRootPath = fileURLToPath(new URL("../../", import.meta.url));
const appPkg = readPackageJson(join(appRootPath, "package.json"));
const workspacePkg = readPackageJson(join(workspaceRootPath, "package.json"));

export default /** @type {import('electron-builder').Configuration} */ ({
  appId: "com.barakxyz.electronxyz.desktop",
  artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
  directories: {
    buildResources: "buildResources",
    output: "dist",
  },
  electronVersion: workspacePkg.devDependencies.electron,
  files: [
    "../../LICENSE*",
    appPkg.main,
    "!node_modules/@app/**",
    ...getListOfFilesFromEachWorkspace(),
  ],
  generateUpdatesFilesForAllChannels: true,
  linux: {
    target: ["deb"],
  },
  productName: "ElectronXYZ",
});

function getListOfFilesFromEachWorkspace() {
  const workspacePackages = collectWorkspacePackages();
  const runtimeWorkspaceNames = collectRuntimeWorkspaceNames(workspacePackages);
  const includedFiles = [];

  for (const name of runtimeWorkspaceNames) {
    const workspacePackage = workspacePackages.get(name);
    if (!workspacePackage) {
      continue;
    }

    const patterns = (workspacePackage.files ?? ["dist/**", "package.json"]).map((pattern) => {
      return join(relativeNodeModulesPathFor(name), pattern);
    });

    includedFiles.push(...patterns);
  }

  return includedFiles;
}

function collectWorkspacePackages() {
  const workspacePackages = new Map();

  for (const workspaceDirectoryName of ["apps", "packages"]) {
    const workspaceDirectoryPath = join(workspaceRootPath, workspaceDirectoryName);
    for (const entry of readdirSync(workspaceDirectoryPath, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const packageJsonPath = join(workspaceDirectoryPath, entry.name, "package.json");
      try {
        const workspacePackage = readPackageJson(packageJsonPath);
        if (typeof workspacePackage.name === "string") {
          workspacePackages.set(workspacePackage.name, workspacePackage);
        }
      } catch {
        // Ignore directories that are not package workspaces.
      }
    }
  }

  return workspacePackages;
}

function collectRuntimeWorkspaceNames(workspacePackages) {
  const pending = Object.entries(appPkg.dependencies ?? {})
    .filter(([, version]) => typeof version === "string" && version.startsWith("workspace:"))
    .map(([dependencyName]) => dependencyName);
  const included = new Set();

  while (pending.length > 0) {
    const dependencyName = pending.pop();
    if (!dependencyName || included.has(dependencyName)) {
      continue;
    }

    const workspacePackage = workspacePackages.get(dependencyName);
    if (!workspacePackage) {
      continue;
    }

    included.add(dependencyName);

    const runtimeDependencies = {
      ...workspacePackage.dependencies,
      ...workspacePackage.optionalDependencies,
    };

    for (const nestedDependencyName of Object.keys(runtimeDependencies)) {
      if (workspacePackages.has(nestedDependencyName)) {
        pending.push(nestedDependencyName);
      }
    }
  }

  return included;
}

function readPackageJson(packageJsonPath) {
  return JSON.parse(readFileSync(packageJsonPath, "utf8"));
}

function relativeNodeModulesPathFor(packageName) {
  return join("..", "..", "node_modules", packageName);
}
