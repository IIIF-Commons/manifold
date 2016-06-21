(<any>global).manifold = (<any>global).Manifold = module.exports = <IManifold>{
    loadManifest: function(options) {
        var bootstrapper = new Manifold.Bootstrapper(options);
        return bootstrapper.bootstrap();
    } 
}

// (function(w) {
//     if (!w.Manifold){
//         w.Manifold = Manifold;
//     }
// })(window);