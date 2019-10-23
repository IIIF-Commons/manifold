import { IIIFResource, Manifest } from "manifesto.js";

export interface IManifoldOptions {
    manifestUri: string;
    iiifResource?: IIIFResource;
    locale?: string;
    manifest?: Manifest; // may be a nested manifest, or the IIIFResource itself
    collectionIndex?: number;
    manifestIndex?: number;
    sequenceIndex?: number;
    canvasIndex?: number;
    rangeId?: string | null;
}