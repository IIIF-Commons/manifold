namespace Manifold {
    export class MetadataGroup {
        public type: MetadataGroupType;
        public name: string;
        public metadata: IMetadataItem[] = [];

        constructor(type: MetadataGroupType, name?: string) {
            this.type = type;
            this.name = name;
        }

        public addItem(item: IMetadataItem): void {
            this.metadata.push(item);
        }

        public addMetadata(metadata: any[], isTranslatable: boolean = false): void {
            for (var i = 0; i < metadata.length; i++) {
                var item: any = metadata[i];
                this.addItem(new MetadataItem(item.label, item.value, isTranslatable));
            }
        }
    }
}