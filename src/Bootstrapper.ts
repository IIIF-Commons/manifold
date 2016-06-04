namespace Manifold {
    
    export class Bootstrapper {
        
        private _options: Manifold.IManifoldOptions;
        
        constructor(options: Manifold.IManifoldOptions){
            this._options = options;
        }
        
        public bootstrap(): Promise<Manifold.Helper> {

            var that = this;

            return new Promise<Manifold.Helper>((resolve, reject) => {
                
                manifesto.loadManifest(that._options.iiifResourceUri).then(function(json){ 
                    
                    var iiifResource: Manifesto.IIIIFResource = manifesto.create(json);
                    
                    // only set the root IIIFResource on the first load
                    if (!that._options.iiifResource){
                        that._options.iiifResource = iiifResource;
                    }

                    if (iiifResource.getIIIFResourceType().toString() === manifesto.IIIFResourceType.collection().toString()){
                        // if it's a collection and has child collections, get the collection by index
                        if ((<Manifesto.ICollection>iiifResource).collections && (<Manifesto.ICollection>iiifResource).collections.length){

                            (<Manifesto.ICollection>iiifResource).getCollectionByIndex(that._options.collectionIndex).then((collection: Manifesto.ICollection) => {

                                if (!collection){
                                    reject();
                                }

                                // Special case: we're trying to load the first manifest of the
                                // collection, but the collection has no manifests but does have
                                // subcollections. Thus, we should dive in until we find something
                                // we can display!
                                if (collection.getTotalManifests() === 0 && this.manifestIndex === 0 && collection.getTotalCollections() > 0) {
                                    that._options.collectionIndex = 0;
                                    that._options.iiifResourceUri = collection.id;
                                    that.bootstrap();
                                }

                                collection.getManifestByIndex(that._options.manifestIndex).then((manifest: Manifesto.IManifest) => {
                                    that._options.manifest = manifest;
                                    var helper: Manifold.Helper = new Helper(that._options);
                                    resolve(helper);
                                });
                            });
                        } else {
                            (<Manifesto.ICollection>iiifResource).getManifestByIndex(that._options.manifestIndex).then((manifest: Manifesto.IManifest) => {
                                that._options.manifest = manifest;
                                var helper: Manifold.Helper = new Helper(that._options);
                                resolve(helper);
                            });
                        }
                    } else {
                        that._options.manifest = <Manifesto.IManifest>iiifResource;
                        var helper: Manifold.Helper = new Helper(that._options);
                        resolve(helper);
                    }
                
                });

            });
        } 
        
    }
    
}