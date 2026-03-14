import { execSync } from "node:child_process";
import process from "node:process";
import { URL, fileURLToPath } from "node:url";
import workspacePackageJson from "../../package.json" with { type: "json" };

const workspaceRootPath = fileURLToPath(new URL("../../", import.meta.url));
const rendererTargetPath = fileURLToPath(new URL("../desktop-renderer", import.meta.url));
const viteVersion = workspacePackageJson.devDependencies["create-vite"] ?? "latest";
const templateIndex = process.argv.findIndex((arg) => arg.startsWith("--template"));
const selectedTemplate = templateIndex !== -1 ? process.argv[templateIndex + 1] : "react-ts";
const templateFlag = selectedTemplate ? `--template ${selectedTemplate}` : "";
const viteFlags = `-- ${templateFlag} --no-immediate`;

try {
  execSync(`pnpm create vite@${viteVersion} ${JSON.stringify(rendererTargetPath)} ${viteFlags}`, {
    cwd: workspaceRootPath,
    stdio: "inherit",
  });
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  process.stderr.write(
    "Failed to execute the `pnpm create vite` command. Please check the Vite version, template, and your network connection.\n",
  );
  process.stderr.write(`Error details: ${errorMessage}\n`);
  process.exit(1);
}
