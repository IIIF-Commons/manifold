namespace Manifold {
    export class MetadataGroup {
        public resource: Manifesto.IManifestResource;
        public label: string;
        public items: MetadataItem[] = [];

        constructor(resource: Manifesto.IManifestResource, label?: string) {
            this.resource = resource;
            this.label = label;
        }

        public addItem(item: Manifold.MetadataItem): void {
            this.items.push(item);
        }

        public addMetadata(metadata: Manifold.MetadataItem[], isRootLevel: boolean = false): void {
            for (var i = 0; i < metadata.length; i++) {
                var metadataItem: Manifold.MetadataItem = <Manifold.MetadataItem>metadata[i];
                metadataItem.isRootLevel = isRootLevel;
                this.addItem(metadataItem);
            }
        }
    }
}