namespace Manifold {

    export function loadManifest(options) {
        var bootstrapper = new Manifold.Bootstrapper(options);
        return bootstrapper.bootstrap();
    } 
}

(<any>global).manifold = (<any>global).Manifold = module.exports = Manifold;

(function(w) {
    if (!w.Manifold){
        w.Manifold = Manifold;
    }
})(window);