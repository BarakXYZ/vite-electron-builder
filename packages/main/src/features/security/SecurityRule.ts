import type { AppModule } from "../../app/AppModule.js";
import type { ModuleContext } from "../../app/ModuleContext.js";

export abstract class SecurityRule implements AppModule {
  enable({ app }: ModuleContext): Promise<void> | void {
    app.on("web-contents-created", (_, contents) => this.applyRule(contents));
  }

  abstract applyRule(contents: Electron.WebContents): Promise<void> | void;
}
