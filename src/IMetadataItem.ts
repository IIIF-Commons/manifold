namespace Manifold {
    export interface IMetadataItem {
        label: string;
        value: string;
        isTranslatable: boolean; // this is used for translating manifest-level properties outside of the metadata collection e.g. license to lizenz
    }
}