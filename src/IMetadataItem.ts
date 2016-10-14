namespace Manifold {

    export interface IMetadataItem extends Manifesto.MetadataItem {
        isRootLevel: boolean;
        setLabel(value: string): void;
        setValue(value: string): void;
    }
    
}