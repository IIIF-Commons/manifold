namespace Manifold {
    export class MetadataItem extends Manifesto.MetadataItem {
        public isRootLevel: boolean; // if the property exists outside of the manifest's metadata node

        setLabel(value: string): void {
            if (this.label.length) {
                var t: Manifesto.Translation = this.label.en().where(x => x.locale === this.defaultLocale).first();
                t.value = value;
            }
        }
    }
}