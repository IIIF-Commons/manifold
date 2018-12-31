import { IManifoldOptions } from "./IManifoldOptions";
import { Bootstrapper } from "./Bootstrapper";
import { Helper } from "./Helper";

export function loadManifest(options: IManifoldOptions): Promise<Helper> {
    const bootstrapper: Bootstrapper = new Bootstrapper(options);
    return bootstrapper.bootstrap();
} 