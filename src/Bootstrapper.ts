import { Helper } from "./Helper";
import { IIIFResourceType } from "@iiif/vocabulary/dist-commonjs";
import { IManifoldOptions } from "./IManifoldOptions";
import {
  Collection,
  IIIFResource,
  IManifestoOptions,
  Manifest,
  Utils
} from "manifesto.js";

export class Bootstrapper {
  private _options: IManifoldOptions;

  constructor(options: IManifoldOptions) {
    this._options = options;
    this._options.locale = this._options.locale || "en-GB"; // default locale
  }

  public bootstrap(
    res?: (helper: Helper) => void,
    rej?: (error: any) => void
  ): Promise<Helper> {
    const that = this;

    return new Promise<Helper>((resolve, reject) => {
      // if this is a recursive bootstrap we will have existing resolve & reject methods.
      if (res && rej) {
        resolve = res;
        reject = rej;
      }

      Utils.loadManifest(that._options.manifestUri).then(json => {
        that._loaded(that, json, resolve, reject);
      });
    });
  }

  public bootstrapJson(
    json: any,
    res?: (helper: Helper) => void,
    rej?: (error: any) => void
  ) {
    return new Promise<Helper>((resolve, reject) => {
      if (res && rej) {
        resolve = res;
        reject = rej;
      }

      this._loaded(this, json, resolve, reject);
    });
  }

  private _loaded(
    bootstrapper: Bootstrapper,
    json: string,
    resolve: (helper: Helper) => void,
    reject: (error: any) => void
  ): void {
    const iiifResource: IIIFResource | null = Utils.parseManifest(json, <
      IManifestoOptions
    >{
      locale: bootstrapper._options.locale
    });

    if (iiifResource) {
      // only set the root IIIFResource on the first load
      if (!bootstrapper._options.iiifResource) {
        bootstrapper._options.iiifResource = iiifResource;
      }

      let collectionIndex: number | undefined =
        bootstrapper._options.collectionIndex; // this is either undefined, 0, or a positive number (defaults to undefined)
      const manifestIndex: number | undefined =
        bootstrapper._options.manifestIndex; // this is either 0 or a positive number (defaults to 0)

      if (iiifResource.getIIIFResourceType() === IIIFResourceType.COLLECTION) {
        // it's a collection

        const manifests: Manifest[] = (<Collection>iiifResource).getManifests();
        const collections: Collection[] = (<Collection>(
          iiifResource
        )).getCollections();

        // if there are only collections available, set the collectionIndex to 0 if undefined.
        if (!manifests.length && collectionIndex === undefined) {
          collectionIndex = 0;
        }

        if (
          collectionIndex !== undefined &&
          collections &&
          collections.length
        ) {
          // a collectionIndex has been passed and we have sub collections

          (<Collection>iiifResource)
            .getCollectionByIndex(collectionIndex)
            .then((collection: Collection) => {
              if (!collection) {
                reject("Collection index not found");
              }

              // Special case: we're trying to load the first manifest of the
              // specified collection, but the collection has no manifests but does have
              // subcollections. Thus, we should dive in until we find something
              // we can display!
              if (
                collection.getTotalManifests() === 0 &&
                manifestIndex === 0 &&
                collection.getTotalCollections() > 0
              ) {
                bootstrapper._options.collectionIndex = 0;
                bootstrapper._options.manifestUri = collection.id;
                bootstrapper.bootstrap(resolve, reject);
              } else if (manifestIndex !== undefined) {
                collection
                  .getManifestByIndex(manifestIndex)
                  .then((manifest: Manifest) => {
                    bootstrapper._options.manifest = manifest;
                    const helper: Helper = new Helper(bootstrapper._options);
                    resolve(helper);
                  });
              }
            });
        } else {
          (<Collection>iiifResource)
            .getManifestByIndex(bootstrapper._options.manifestIndex as number)
            .then((manifest: Manifest) => {
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
      console.error("Unable to load IIIF resource");
    }
  }
}
