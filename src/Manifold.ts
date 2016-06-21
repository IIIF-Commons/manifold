(<any>global).manifold = (<any>global).Manifold = module.exports = <IManifold>{
    TreeSortType: new Manifold.TreeSortType(),
    loadManifest: function(options) {
        var bootstrapper = new Manifold.Bootstrapper(options);
        return bootstrapper.bootstrap();
    }
}