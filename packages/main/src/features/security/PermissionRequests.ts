import { SecurityRule } from "./SecurityRule.js";

/**
 * Deny all permission requests by default.
 *
 * @see https://www.electronjs.org/docs/latest/tutorial/security#5-handle-session-permission-requests-from-remote-content
 */
export class PermissionRequests extends SecurityRule {
  applyRule(contents: Electron.WebContents): void {
    contents.session.setPermissionRequestHandler((_, __, callback) => {
      callback(false);
    });

    contents.session.setPermissionCheckHandler(() => false);
  }
}

export function denyPermissionRequests(...args: ConstructorParameters<typeof PermissionRequests>) {
  return new PermissionRequests(...args);
}
