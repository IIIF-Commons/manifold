interface IManifold {
    loadManifest: (options: Manifold.IManifoldOptions) => Promise<Manifold.IHelper>;
    TreeSortType: Manifold.TreeSortType;
}