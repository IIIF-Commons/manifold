namespace Manifold {
    export function loadManifest(options: Manifold.IManifoldOptions) {
        var bootstrapper = new Manifold.Bootstrapper(options);
        return bootstrapper.bootstrap();
    } 
}

(function(g: any) {
    if (!g.Manifold){
        g.Manifold = Manifold;
    }
})(global);