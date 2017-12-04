/// <reference types="manifesto.js" />

namespace Manifold {
    export function loadManifest(options: Manifold.IManifoldOptions) {
        const bootstrapper: Bootstrapper = new Bootstrapper(options);
        return bootstrapper.bootstrap();
    } 
}

(function(g: any) {
    if (!g.Manifold) {
        g.Manifold = Manifold;
    }
})(global);