namespace Manifold {
    export interface IMetadataItem {
        label: string;
        value: string | IMetadataItem[];
        isRootLevel: boolean;
    }
}