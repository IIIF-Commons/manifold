import { IManifoldOptions } from "./IManifoldOptions";
import { Helper } from "./Helper";

export class Bootstrapper {
    
    private _options: IManifoldOptions;
    
    constructor(options: IManifoldOptions){
        this._options = options;
        this._options.locale = this._options.locale || 'en-GB'; // default locale
    }

    public bootstrap(res?: (helper: Helper) => void, rej?: (error:any) => void): Promise<Helper> {

        const that = this;

        return new Promise<Helper>((resolve, reject) => {

            // if this is a recursive bootstrap we will have existing resolve & reject methods.
            if (res && rej) {
                resolve = res;
                reject = rej;
            }

            const msie = that._detectIE();

            if (msie === false) {
                manifesto.Utils.loadManifest(that._options.manifestUri).then(function(json) {                     
                    that._loaded(that, json, resolve, reject)
                });
            } else {
                // if not a recent version of IE
                if (msie > 0) {
                    
                    if (msie === 9) {
                        // CORS not available, use jsonp

                        const settings: JQueryAjaxSettings = <JQueryAjaxSettings>{
                            url: that._options.manifestUri,
                            type: 'GET',
                            dataType: 'jsonp',
                            jsonp: 'callback',
                            jsonpCallback: 'manifestCallback'
                        };

                        $.ajax(settings);

                        window.manifestCallback = (json: any) => {
                            that._loaded(that, JSON.stringify(json), resolve, reject);
                        };

                    } else {
                        $.getJSON(that._options.manifestUri, (json) => {
                            that._loaded(that, JSON.stringify(json), resolve, reject);
                        });
                    }

                }
            }

        });
    }

    private _loaded(bootstrapper: Bootstrapper, json: string, resolve: (helper: Helper) => void, reject: (error:any) => void): void {
        
        const iiifResource: manifesto.IIIFResource | null = manifesto.Utils.parseManifest(json, <manifesto.IManifestoOptions>{
            locale: bootstrapper._options.locale
        });

        if (iiifResource) {

            // only set the root IIIFResource on the first load
            if (!bootstrapper._options.iiifResource) {
                bootstrapper._options.iiifResource = iiifResource;
            }

            let collectionIndex: number | undefined = bootstrapper._options.collectionIndex; // this is either undefined, 0, or a positive number (defaults to undefined)
            const manifestIndex: number | undefined = bootstrapper._options.manifestIndex; // this is either 0 or a positive number (defaults to 0)

            if (iiifResource.getIIIFResourceType().toString() === manifesto.IIIFResourceType.collection().toString() ||
                iiifResource.getIIIFResourceType().toString().toLowerCase() === 'collection') { // todo: use constant
                
                // it's a collection

                const manifests: manifesto.Manifest[] = (<manifesto.Collection>iiifResource).getManifests();
                const collections: manifesto.Collection[] = (<manifesto.Collection>iiifResource).getCollections();

                // if there are only collections available, set the collectionIndex to 0 if undefined.
                if (!manifests.length && collectionIndex === undefined) {
                    collectionIndex = 0;
                }

                if (collectionIndex !== undefined && collections && collections.length) {

                    // a collectionIndex has been passed and we have sub collections

                    (<manifesto.Collection>iiifResource).getCollectionByIndex(collectionIndex).then((collection: manifesto.Collection) => {

                        if (!collection) {
                            reject('Collection index not found');
                        }

                        // Special case: we're trying to load the first manifest of the
                        // specified collection, but the collection has no manifests but does have
                        // subcollections. Thus, we should dive in until we find something
                        // we can display!
                        if (collection.getTotalManifests() === 0 && manifestIndex === 0 && collection.getTotalCollections() > 0) {
                            bootstrapper._options.collectionIndex = 0;
                            bootstrapper._options.manifestUri = collection.id;
                            bootstrapper.bootstrap(resolve, reject);
                        } else if (manifestIndex !== undefined) {
                            collection.getManifestByIndex(manifestIndex).then((manifest: manifesto.Manifest) => {
                                bootstrapper._options.manifest = manifest;
                                const helper: Helper = new Helper(bootstrapper._options);
                                resolve(helper);
                            });
                        }
                    });

                } else {
                    (<manifesto.Collection>iiifResource).getManifestByIndex(bootstrapper._options.manifestIndex as number).then((manifest: manifesto.Manifest) => {
                        bootstrapper._options.manifest = manifest;
                        const helper: Helper = new Helper(bootstrapper._options);
                        resolve(helper);
                    });
                }
            } else {
                bootstrapper._options.manifest = <manifesto.Manifest>iiifResource;
                const helper: Helper = new Helper(bootstrapper._options);
                resolve(helper);
            }
        } else {
            console.error('Unable to load IIIF resource');
        }

    }

    private _detectIE(): number | boolean {
        const ua = window.navigator.userAgent;

        // Test values; Uncomment to check result …

        // IE 10
        // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
        
        // IE 11
        // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
        
        // Edge 12 (Spartan)
        // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
        
        // Edge 13
        // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

        const msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        const trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            const rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        const edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    }
}