namespace Manifold {
    export class MetadataGroup {
        public resource: Manifesto.IManifestResource;
        public label: string;
        public items: Manifold.IMetadataItem[] = [];

        constructor(resource: Manifesto.IManifestResource, label?: string) {
            this.resource = resource;
            this.label = label;
        }

        public addItem(item: Manifold.IMetadataItem): void {
            this.items.push(item);
        }

        public addMetadata(metadata: Manifesto.MetadataItem[], isRootLevel: boolean = false): void {
            for (var i = 0; i < metadata.length; i++) {
                var item: Manifesto.MetadataItem = metadata[i];
                (<Manifold.IMetadataItem>item).isRootLevel = isRootLevel;
                this.addItem(<Manifold.IMetadataItem>item);
            }
        }
    }
}