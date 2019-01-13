import { IMetadataItem } from "./IMetadataItem";

export class MetadataGroup {
    public resource: manifesto.ManifestResource;
    public label: string | undefined;
    public items: IMetadataItem[] = [];

    constructor(resource: manifesto.ManifestResource, label?: string) {
        this.resource = resource;
        this.label = label;
    }

    public addItem(item: IMetadataItem): void {
        this.items.push(item);
    }

    public addMetadata(metadata: manifesto.LabelValuePair[], isRootLevel: boolean = false): void {
        for (let i = 0; i < metadata.length; i++) {
            const item: manifesto.LabelValuePair = metadata[i];
            (<IMetadataItem>item).isRootLevel = isRootLevel;
            this.addItem(<IMetadataItem>item);
        }
    }
}