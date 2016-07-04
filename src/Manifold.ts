namespace Manifold {
    export function loadManifest(options) {
        var bootstrapper = new Manifold.Bootstrapper(options);
        return bootstrapper.bootstrap();
    } 
}

(function(w) {
    if (!w.Manifold){
        w.Manifold = w.manifold = Manifold;
    }
})(window);