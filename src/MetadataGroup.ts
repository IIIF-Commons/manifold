namespace Manifold {
    export class MetadataGroup {
        public resource: Manifesto.IManifestResource;
        public label: string;
        public items: IMetadataItem[] = [];

        constructor(resource: Manifesto.IManifestResource, label?: string) {
            this.resource = resource;
            this.label = label;
        }

        public addItem(item: IMetadataItem): void {
            this.items.push(item);
        }

        public addMetadata(metadata: any[], isTranslatable: boolean = false): void {
            for (var i = 0; i < metadata.length; i++) {
                var item: any = metadata[i];
                this.addItem(new MetadataItem(item.label, item.value, isTranslatable));
            }
        }
    }
}