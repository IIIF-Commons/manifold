namespace Manifold {
    export class MetadataGroup {
        public resource: Manifesto.IManifestResource;
        public label: string;
        public items: Manifold.MetadataItem[] = [];

        constructor(resource: Manifesto.IManifestResource, label?: string) {
            this.resource = resource;
            this.label = label;
        }

        public addItem(item: Manifold.MetadataItem): void {
            var metadataItem: Manifold.MetadataItem = this._convertItem(item);
            this.items.push(metadataItem);
        }

        public addMetadata(metadata: Manifesto.MetadataItem[], isRootLevel: boolean = false): void {
            for (var i = 0; i < metadata.length; i++) {
                var item: Manifesto.MetadataItem = metadata[i];
                var metadataItem: Manifold.MetadataItem = this._convertItem(item);
                metadataItem.isRootLevel = isRootLevel;
                this.addItem(metadataItem);
            }
        }

        private _convertItem(item: Manifesto.MetadataItem): Manifold.MetadataItem {
            var metadataItem: Manifold.MetadataItem = new Manifold.MetadataItem(item.defaultLocale);
            metadataItem.parse(item.resource);
            return metadataItem;
        }
    }
}