namespace Manifold {
    export class MetadataItem implements IMetadataItem {
        public label: string;
        public value: string;
        public isTranslatable: boolean;

        constructor(label: string, value: string, isTranslatable: boolean = false) {
            this.label = label;
            this.value = value;
            this.isTranslatable = isTranslatable; 
        }
    }
}