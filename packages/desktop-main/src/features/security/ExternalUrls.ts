import type { AppModule } from "../../app/AppModule.js";
import type { ModuleContext } from "../../app/ModuleContext.js";
import { shell } from "electron";
import { URL } from "node:url";
import { emitDevSecurityWarning } from "./devSecurityWarning.js";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error as { readonly message?: unknown };
    if (typeof message === "string") {
      return message;
    }
  }

  return String(error);
}

export class ExternalUrls implements AppModule {
  readonly #externalUrls: Set<string>;

  constructor(externalUrls: Set<string>) {
    this.#externalUrls = externalUrls;
  }

  enable({ app }: ModuleContext): Promise<void> | void {
    app.on("web-contents-created", (_, contents) => {
      contents.setWindowOpenHandler(({ url }) => {
        const { origin } = new URL(url);

        if (this.#externalUrls.has(origin)) {
          void shell.openExternal(url).catch((error: unknown) => {
            emitDevSecurityWarning(
              `Failed to open external origin ${origin}: ${getErrorMessage(error)}`,
            );
          });
        } else {
          emitDevSecurityWarning(`Blocked the opening of a disallowed external origin: ${origin}`);
        }

        // Prevent creating a new window.
        return { action: "deny" };
      });
    });
  }
}

export function allowExternalUrls(...args: ConstructorParameters<typeof ExternalUrls>) {
  return new ExternalUrls(...args);
}
