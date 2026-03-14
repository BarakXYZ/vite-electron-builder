import type { AppModule } from "../../app/AppModule.js";
import type { ModuleContext } from "../../app/ModuleContext.js";

class ApplicationTerminatorOnLastWindowClose implements AppModule {
  enable({ app }: ModuleContext): Promise<void> | void {
    app.on("window-all-closed", () => app.quit());
  }
}

export function terminateAppOnLastWindowClose(
  ...args: ConstructorParameters<typeof ApplicationTerminatorOnLastWindowClose>
) {
  return new ApplicationTerminatorOnLastWindowClose(...args);
}
