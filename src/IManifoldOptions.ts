namespace Manifold {
    export interface IManifoldOptions {
        iiifResourceUri: string;
        iiifResource: Manifesto.IIIIFResource;
        manifest: Manifesto.IManifest; // may be a nested manifest, or the IIIFResource itself
        //licenseMap: Object;
        collectionIndex: number;
        manifestIndex: number;
        sequenceIndex: number;
        canvasIndex: number;
    }
}