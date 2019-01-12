import { IManifoldOptions } from "./IManifoldOptions";
import { Helper } from "./Helper";
import { IIIFResourceType, Collection, Manifest, IIIFResource, IManifestoOptions, Utils } from "manifesto.js";

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
                Utils.loadManifest(that._options.manifestUri).then(function(json) {                     
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
        
        const iiifResource: IIIFResource | null = Utils.parseManifest(json, <IManifestoOptions>{
            locale: bootstrapper._options.locale
        });

        if (iiifResource) {

            // only set the root IIIFResource on the first load
            if (!bootstrapper._options.iiifResource) {
                bootstrapper._options.iiifResource = iiifResource;
            }

            if (iiifResource.getIIIFResourceType() === IIIFResourceType.COLLECTION) { 
                // if it's a collection and has child collections, get the collection by index
                const collections: Collection[] = (<Collection>iiifResource).getCollections();

                if (collections && collections.length) {

                    (<Collection>iiifResource).getCollectionByIndex(bootstrapper._options.collectionIndex).then((collection: Collection) => {

                        if (!collection) {
                            reject('Collection index not found');
                        }

                        // Special case: we're trying to load the first manifest of the
                        // collection, but the collection has no manifests but does have
                        // subcollections. Thus, we should dive in until we find something
                        // we can display!
                        if (collection.getTotalManifests() === 0 && bootstrapper._options.manifestIndex === 0 && collection.getTotalCollections() > 0) {
                            bootstrapper._options.collectionIndex = 0;
                            bootstrapper._options.manifestUri = collection.id;
                            bootstrapper.bootstrap(resolve, reject);
                        } else {
                            collection.getManifestByIndex(bootstrapper._options.manifestIndex).then((manifest: Manifest) => {
                                bootstrapper._options.manifest = manifest;
                                const helper: Helper = new Helper(bootstrapper._options);
                                resolve(helper);
                            });
                        }
                    });
                } else {
                    (<Collection>iiifResource).getManifestByIndex(bootstrapper._options.manifestIndex).then((manifest: Manifest) => {
                        bootstrapper._options.manifest = manifest;
                        const helper: Helper = new Helper(bootstrapper._options);
                        resolve(helper);
                    });
                }
            } else {
                bootstrapper._options.manifest = <Manifest>iiifResource;
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