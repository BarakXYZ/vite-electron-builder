import type { AppModule } from "../../app/AppModule.js";
import type { ModuleContext } from "../../app/ModuleContext.js";

class SingleInstanceApp implements AppModule {
  enable({ app }: ModuleContext): void {
    const isSingleInstance = app.requestSingleInstanceLock();
    if (!isSingleInstance) {
      app.quit();
      process.exit(0);
    }
  }
}

export function disallowMultipleAppInstance(
  ...args: ConstructorParameters<typeof SingleInstanceApp>
) {
  return new SingleInstanceApp(...args);
}
