export interface IManifoldOptions {
    manifestUri: string;
    iiifResource?: manifesto.IIIFResource;
    locale?: string;
    manifest?: manifesto.Manifest; // may be a nested manifest, or the IIIFResource itself
    collectionIndex?: number;
    manifestIndex?: number;
    sequenceIndex?: number;
    canvasIndex?: number;
    rangeId?: string | null;
}