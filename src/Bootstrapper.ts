namespace Manifold {
    
    export class Bootstrapper {
        
        private _options: Manifold.IManifoldOptions;
        
        constructor(options: Manifold.IManifoldOptions){
            this._options = options;
            this._options.locale = this._options.locale || 'en-GB'; // default locale
        }

        public bootstrap(res?: (helper: IHelper) => void, rej?: (error:any) => void): Promise<Manifold.IHelper> {

            const that = this;

            return new Promise<Manifold.IHelper>((resolve, reject) => {

                // if this is a recursive bootstrap we will have existing resolve & reject methods.
                if (res && rej) {
                    resolve = res;
                    reject = rej;
                }

                const msie = that._detectIE();

                if (msie === false) {
                    manifesto.loadManifest(that._options.iiifResourceUri).then(function(json) {                     
                        that._loaded(that, json, resolve, reject)
                    });
                } else {
                    // if not a recent version of IE
                    if (msie > 0) {
                        
                        if (msie === 9) {
                            // CORS not available, use jsonp

                            const settings: JQueryAjaxSettings = <JQueryAjaxSettings>{
                                url: that._options.iiifResourceUri,
                                type: 'GET',
                                dataType: 'jsonp',
                                jsonp: 'callback',
                                jsonpCallback: 'manifestCallback'
                            };

                            $.ajax(settings);

                            global.manifestCallback = (json: any) => {
                                that._loaded(that, JSON.stringify(json), resolve, reject);
                            };

                        } else {
                            $.getJSON(that._options.iiifResourceUri, (json) => {
                                that._loaded(that, JSON.stringify(json), resolve, reject);
                            });
                        }

                    }
                }

            });
        }

        private _loaded(bootstrapper: Bootstrapper, json: string, resolve: (helper: IHelper) => void, reject: (error:any) => void): void {
            
            const iiifResource: Manifesto.IIIIFResource = manifesto.create(json, <Manifesto.IManifestoOptions>{
                locale: bootstrapper._options.locale
            });
            
            // only set the root IIIFResource on the first load
            if (!bootstrapper._options.iiifResource) {
                bootstrapper._options.iiifResource = iiifResource;
            }

            if (iiifResource.getIIIFResourceType().toString() === manifesto.IIIFResourceType.collection().toString() ||
                iiifResource.getIIIFResourceType().toString().toLowerCase() === 'collection') { // todo: use constant
                // if it's a collection and has child collections, get the collection by index
                const collections: Manifesto.ICollection[] = (<Manifesto.ICollection>iiifResource).getCollections();

                if (collections && collections.length) {

                    (<Manifesto.ICollection>iiifResource).getCollectionByIndex(bootstrapper._options.collectionIndex).then((collection: Manifesto.ICollection) => {

                        if (!collection){
                            reject('Collection index not found');
                        }

                        // Special case: we're trying to load the first manifest of the
                        // collection, but the collection has no manifests but does have
                        // subcollections. Thus, we should dive in until we find something
                        // we can display!
                        if (collection.getTotalManifests() === 0 && bootstrapper._options.manifestIndex === 0 && collection.getTotalCollections() > 0) {
                            bootstrapper._options.collectionIndex = 0;
                            bootstrapper._options.iiifResourceUri = collection.id;
                            bootstrapper.bootstrap(resolve, reject);
                        } else {
                            collection.getManifestByIndex(bootstrapper._options.manifestIndex).then((manifest: Manifesto.IManifest) => {
                                bootstrapper._options.manifest = manifest;
                                const helper: Manifold.Helper = new Helper(bootstrapper._options);
                                resolve(helper);
                            });
                        }
                    });
                } else {
                    (<Manifesto.ICollection>iiifResource).getManifestByIndex(bootstrapper._options.manifestIndex).then((manifest: Manifesto.IManifest) => {
                        bootstrapper._options.manifest = manifest;
                        const helper: Manifold.Helper = new Helper(bootstrapper._options);
                        resolve(helper);
                    });
                }
            } else {
                bootstrapper._options.manifest = <Manifesto.IManifest>iiifResource;
                const helper: Manifold.Helper = new Helper(bootstrapper._options);
                resolve(helper);
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
    
}