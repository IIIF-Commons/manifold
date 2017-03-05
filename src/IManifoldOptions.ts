namespace Manifold {
    export interface IManifoldOptions {
        iiifResourceUri: string;
        iiifResource: Manifesto.IIIIFResource | null;
        locale: string;
        manifest: Manifesto.IManifest; // may be a nested manifest, or the IIIFResource itself
        collectionIndex: number;
        manifestIndex: number;
        sequenceIndex: number;
        canvasIndex: number;
    }
}