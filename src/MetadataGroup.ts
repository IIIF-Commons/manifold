import { IMetadataItem } from "./IMetadataItem";
import { ManifestResource, LabelValuePair } from "manifesto.js";

export class MetadataGroup {
    public resource: ManifestResource;
    public label: string | undefined;
    public items: IMetadataItem[] = [];

    constructor(resource: ManifestResource, label?: string) {
        this.resource = resource;
        this.label = label;
    }

    public addItem(item: IMetadataItem): void {
        this.items.push(item);
    }

    public addMetadata(metadata: LabelValuePair[], isRootLevel: boolean = false): void {
        for (let i = 0; i < metadata.length; i++) {
            const item: LabelValuePair = metadata[i];
            (<IMetadataItem>item).isRootLevel = isRootLevel;
            this.addItem(<IMetadataItem>item);
        }
    }
}