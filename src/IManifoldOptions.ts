namespace Manifold {
    export interface IManifoldOptions {
        manifest: Manifesto.IManifest;
        manifestUri: string;
        licenseMap: Object;
        collectionIndex: number;
        manifestIndex: number;
        sequenceIndex: number;
        canvasIndex: number;
    }
}