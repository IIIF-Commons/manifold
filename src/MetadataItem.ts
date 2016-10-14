namespace Manifold {
    export class MetadataItem extends Manifesto.MetadataItem {
        public isRootLevel: boolean; // if the property exists outside of the manifest's metadata node

        constructor(item: any, defaultLocale: string) {
            super(item, defaultLocale);
        }

        public setLabel(value: string): void {
            if (this.label.length) {
                var t: Manifesto.Translation = this.label.en().where(x => x.locale === this.defaultLocale || x.locale === Manifesto.Utils.getInexactLocale(this.defaultLocale)).first();
                t.value = value;
            }
        }

        public setValue(value: string): void {
            if (this.value.length) {
                var t: Manifesto.Translation = this.value.en().where(x => x.locale === this.defaultLocale || x.locale === Manifesto.Utils.getInexactLocale(this.defaultLocale)).first();
                t.value = value;
            }
        }
    }
}