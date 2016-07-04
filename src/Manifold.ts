namespace Manifold {
    export function loadManifest(options) {
        var bootstrapper = new Manifold.Bootstrapper(options);
        return bootstrapper.bootstrap();
    } 
}