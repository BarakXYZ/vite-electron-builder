import type { AppModule } from "../../app/AppModule.js";
import type { ModuleContext } from "../../app/ModuleContext.js";

export class HardwareAccelerationModule implements AppModule {
  readonly #shouldBeDisabled: boolean;

  constructor({ enable }: { enable: boolean }) {
    this.#shouldBeDisabled = !enable;
  }

  enable({ app }: ModuleContext): Promise<void> | void {
    if (this.#shouldBeDisabled) {
      app.disableHardwareAcceleration();
    }
  }
}

export function hardwareAccelerationMode(
  ...args: ConstructorParameters<typeof HardwareAccelerationModule>
) {
  return new HardwareAccelerationModule(...args);
}
