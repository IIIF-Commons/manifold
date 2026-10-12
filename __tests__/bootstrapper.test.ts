import { Collection, Utils } from "manifesto.js";
import { loadManifest, loadManifestJson } from "../src";

const TOP_ID = "https://example.org/iiif/collection/top";
const SUB_ID = "https://example.org/iiif/collection/sub";
const MANIFEST_ID = "https://example.org/iiif/manifest/1";

type Ref = { id: string; label: string };

// Builds the same IIIF documents in each Presentation API version's shape.
interface Presentation {
  collection(id: string, refs: { collections?: Ref[]; manifests?: Ref[] }): any;
  manifest(id: string): any;
}

const v2: Presentation = {
  collection: (id, { collections, manifests }) => {
    const json: any = {
      "@context": "http://iiif.io/api/presentation/2/context.json",
      "@id": id,
      "@type": "sc:Collection",
      label: id,
    };
    if (collections) {
      json.collections = collections.map((c) => ({
        "@id": c.id,
        "@type": "sc:Collection",
        label: c.label,
      }));
    }
    if (manifests) {
      json.manifests = manifests.map((m) => ({
        "@id": m.id,
        "@type": "sc:Manifest",
        label: m.label,
      }));
    }
    return json;
  },
  manifest: (id) => ({
    "@context": "http://iiif.io/api/presentation/2/context.json",
    "@id": id,
    "@type": "sc:Manifest",
    label: id,
    sequences: [{ "@type": "sc:Sequence", canvases: [] }],
  }),
};

const v3: Presentation = {
  collection: (id, { collections = [], manifests = [] }) => ({
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id,
    type: "Collection",
    label: { en: [id] },
    items: [
      ...collections.map((c) => ({
        id: c.id,
        type: "Collection",
        label: { en: [c.label] },
      })),
      ...manifests.map((m) => ({
        id: m.id,
        type: "Manifest",
        label: { en: [m.label] },
      })),
    ],
  }),
  manifest: (id) => ({
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id,
    type: "Manifest",
    label: { en: [id] },
    items: [],
  }),
};

// Mirrors the error shape Manifesto rejects with (IIIF-Commons/manifesto#196).
function httpError(status: number, url: string): Error {
  const error: any = new Error("Not Found");
  error.status = status;
  error.url = url;
  error.response = { status };
  return error;
}

function indexError(message: string, url: string, index: number): Error {
  const error: any = new Error(message);
  error.url = url;
  error.index = index;
  return error;
}

// Serves JSON by URL; rejects after `limit` calls so a runaway loop still ends.
function serveJson(byUrl: Record<string, () => any>, limit = 50) {
  let calls = 0;
  return jest.spyOn(Utils, "loadManifest").mockImplementation((url) => {
    calls++;
    if (calls > limit) {
      return Promise.reject(new Error("runaway loading loop"));
    }
    return Promise.resolve(byUrl[url]());
  });
}

// Fails fast instead of hitting the Jest timeout when a promise never settles.
function settle<T>(promise: Promise<T>, ms = 500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("promise did not settle")), ms)
    ),
  ]);
}

// Shared documents for one Presentation API version.
function fixtures(iiif: Presentation) {
  return {
    topCollection: () =>
      iiif.collection(TOP_ID, {
        collections: [{ id: SUB_ID, label: "Sub" }],
        manifests: [{ id: MANIFEST_ID, label: "Manifest 1" }],
      }),
    subCollection: () =>
      iiif.collection(SUB_ID, {
        manifests: [{ id: MANIFEST_ID, label: "Manifest 1" }],
      }),
    // A collection with no manifests whose only member is another collection.
    wrapperCollection: (id: string, childId: string) =>
      iiif.collection(id, { collections: [{ id: childId, label: childId }] }),
    manifest: () => iiif.manifest(MANIFEST_ID),
  };
}

describe.each([
  ["Presentation 2", v2],
  ["Presentation 3", v3],
])("Bootstrapper loading (%s)", (_name, iiif) => {
  const { topCollection, subCollection, wrapperCollection, manifest } =
    fixtures(iiif);
  const MANIFEST_2_ID = "https://example.org/iiif/manifest/2";

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("loads a manifest from JSON", async () => {
    const helper = await settle(
      loadManifestJson(manifest(), { manifestUri: MANIFEST_ID })
    );

    expect(helper.manifest!.id).toBe(MANIFEST_ID);
    expect(helper.iiifResource!.id).toBe(MANIFEST_ID);
  });

  test("loads a manifest from a URL", async () => {
    const load = serveJson({ [MANIFEST_ID]: manifest });

    const helper = await settle(loadManifest({ manifestUri: MANIFEST_ID }));

    expect(load).toHaveBeenCalledWith(MANIFEST_ID);
    expect(helper.manifest!.id).toBe(MANIFEST_ID);
  });

  test("defaults the locale to en-GB", async () => {
    const helper = await settle(
      loadManifestJson(manifest(), { manifestUri: MANIFEST_ID })
    );

    expect(helper.options.locale).toBe("en-GB");
  });

  test("loads the manifest at manifestIndex from a collection", async () => {
    serveJson({
      [MANIFEST_ID]: manifest,
      [MANIFEST_2_ID]: () => iiif.manifest(MANIFEST_2_ID),
    });
    const json = iiif.collection(TOP_ID, {
      manifests: [
        { id: MANIFEST_ID, label: "Manifest 1" },
        { id: MANIFEST_2_ID, label: "Manifest 2" },
      ],
    });

    const helper = await settle(
      loadManifestJson(json, { manifestUri: TOP_ID, manifestIndex: 1 })
    );

    expect(helper.manifest!.id).toBe(MANIFEST_2_ID);
    expect(helper.manifestIndex).toBe(1);
    expect(helper.iiifResource!.id).toBe(TOP_ID);
  });

  test("loads a manifest from the sub-collection at collectionIndex", async () => {
    serveJson({ [SUB_ID]: subCollection, [MANIFEST_ID]: manifest });

    const helper = await settle(
      loadManifestJson(topCollection(), {
        manifestUri: TOP_ID,
        collectionIndex: 0,
        manifestIndex: 0,
      })
    );

    expect(helper.manifest!.id).toBe(MANIFEST_ID);
    expect(helper.collectionIndex).toBe(0);
    expect(helper.iiifResource!.id).toBe(TOP_ID);
  });

  test("loads the first sub-collection when a collection has only sub-collections", async () => {
    serveJson({ [SUB_ID]: subCollection, [MANIFEST_ID]: manifest });
    const json = iiif.collection(TOP_ID, {
      collections: [{ id: SUB_ID, label: "Sub" }],
    });

    const helper = await settle(
      loadManifestJson(json, { manifestUri: TOP_ID, manifestIndex: 0 })
    );

    expect(helper.manifest!.id).toBe(MANIFEST_ID);
  });

  test("dives through nested collections to find the first manifest", async () => {
    const MIDDLE_ID = "https://example.org/iiif/collection/middle";
    serveJson({
      [MIDDLE_ID]: () => wrapperCollection(MIDDLE_ID, SUB_ID),
      [SUB_ID]: subCollection,
      [MANIFEST_ID]: manifest,
    });

    const helper = await settle(
      loadManifestJson(wrapperCollection(TOP_ID, MIDDLE_ID), {
        manifestUri: TOP_ID,
        manifestIndex: 0,
      })
    );

    expect(helper.manifest!.id).toBe(MANIFEST_ID);
    expect(helper.iiifResource!.id).toBe(TOP_ID);
  });
});

describe.each([
  ["Presentation 2", v2],
  ["Presentation 3", v3],
])("Bootstrapper error handling (%s)", (_name, iiif) => {
  const { topCollection, subCollection, wrapperCollection, manifest } =
    fixtures(iiif);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("rejects with Manifesto's error when the top-level manifest fails to load", async () => {
    const error = httpError(404, MANIFEST_ID);
    jest.spyOn(Utils, "loadManifest").mockRejectedValue(error);

    await expect(
      settle(loadManifest({ manifestUri: MANIFEST_ID }))
    ).rejects.toBe(error);
  });

  test("rejects when a collection's manifest fails to load", async () => {
    const error = httpError(404, MANIFEST_ID);
    jest
      .spyOn(Collection.prototype, "getManifestByIndex")
      .mockRejectedValue(error);

    await expect(
      settle(
        loadManifestJson(topCollection(), {
          manifestUri: TOP_ID,
          manifestIndex: 0,
        })
      )
    ).rejects.toBe(error);
  });

  test("rejects with Manifesto's error when the manifest index does not exist", async () => {
    const error = indexError("Manifest index not found", TOP_ID, 99);
    jest
      .spyOn(Collection.prototype, "getManifestByIndex")
      .mockRejectedValue(error);

    await expect(
      settle(
        loadManifestJson(topCollection(), {
          manifestUri: TOP_ID,
          manifestIndex: 99,
        })
      )
    ).rejects.toBe(error);
  });

  test("rejects when a child collection fails to load", async () => {
    const error = httpError(404, SUB_ID);
    jest
      .spyOn(Collection.prototype, "getCollectionByIndex")
      .mockRejectedValue(error);

    await expect(
      settle(
        loadManifestJson(topCollection(), {
          manifestUri: TOP_ID,
          collectionIndex: 0,
          manifestIndex: 0,
        })
      )
    ).rejects.toBe(error);
  });

  test("rejects when a child collection loads but its manifest fails", async () => {
    const error = httpError(500, MANIFEST_ID);
    const sub = Utils.parseManifest(subCollection()) as Collection;
    jest
      .spyOn(Collection.prototype, "getCollectionByIndex")
      .mockResolvedValue(sub);
    jest
      .spyOn(Collection.prototype, "getManifestByIndex")
      .mockRejectedValue(error);

    await expect(
      settle(
        loadManifestJson(topCollection(), {
          manifestUri: TOP_ID,
          collectionIndex: 0,
          manifestIndex: 0,
        })
      )
    ).rejects.toBe(error);
  });

  test("rejects when an older Manifesto throws synchronously for a missing index", async () => {
    const error = new Error("Manifest index not found");
    const sub = Utils.parseManifest(subCollection()) as Collection;
    jest
      .spyOn(Collection.prototype, "getCollectionByIndex")
      .mockResolvedValue(sub);
    jest
      .spyOn(Collection.prototype, "getManifestByIndex")
      .mockImplementation(() => {
        throw error;
      });

    await expect(
      settle(
        loadManifestJson(topCollection(), {
          manifestUri: TOP_ID,
          collectionIndex: 0,
          manifestIndex: 5,
        })
      )
    ).rejects.toBe(error);
  });

  test("rejects when a child collection loads but no manifestIndex is given", async () => {
    const sub = Utils.parseManifest(subCollection()) as Collection;
    jest
      .spyOn(Collection.prototype, "getCollectionByIndex")
      .mockResolvedValue(sub);

    await expect(
      settle(
        loadManifestJson(topCollection(), {
          manifestUri: TOP_ID,
          collectionIndex: 0,
        })
      )
    ).rejects.toMatchObject({ message: "Manifest index not found" });
  });

  test("rejects with Manifesto's error when the collection index does not exist", async () => {
    await expect(
      settle(
        loadManifestJson(topCollection(), {
          manifestUri: TOP_ID,
          collectionIndex: 5,
          manifestIndex: 0,
        })
      )
    ).rejects.toMatchObject({ message: "Collection index not found" });
  });

  test("loads the manifest when collectionIndex is given but there are no sub-collections", async () => {
    serveJson({ [MANIFEST_ID]: manifest });
    const json = iiif.collection(TOP_ID, {
      manifests: [{ id: MANIFEST_ID, label: "Manifest 1" }],
    });

    const helper = await settle(
      loadManifestJson(json, {
        manifestUri: TOP_ID,
        collectionIndex: 0,
        manifestIndex: 0,
      })
    );

    expect(helper.manifest!.id).toBe(MANIFEST_ID);
  });

  test("rejects when a collection contains itself", async () => {
    serveJson({ [TOP_ID]: () => wrapperCollection(TOP_ID, TOP_ID) });

    const promise = settle(
      loadManifestJson(wrapperCollection(TOP_ID, TOP_ID), {
        manifestUri: TOP_ID,
        manifestIndex: 0,
      })
    );

    await expect(promise).rejects.toBeInstanceOf(Error);
    await expect(promise).rejects.toMatchObject({
      message: "Collection contains itself",
      url: TOP_ID,
    });
  });

  test("rejects when collections are nested more than 10 deep", async () => {
    const id = (i: number) => `https://example.org/iiif/collection/${i}`;
    const byUrl: Record<string, () => any> = {};
    for (let i = 0; i < 30; i++) {
      byUrl[id(i)] = () => wrapperCollection(id(i), id(i + 1));
    }
    serveJson(byUrl);

    const promise = settle(
      loadManifestJson(wrapperCollection(id(0), id(1)), {
        manifestUri: id(0),
        manifestIndex: 0,
      })
    );

    await expect(promise).rejects.toBeInstanceOf(Error);
    await expect(promise).rejects.toMatchObject({
      message: "Collections are nested too deeply",
    });
  });

  test("rejects with an Error carrying the url when the JSON is not a IIIF resource", async () => {
    const promise = settle(
      loadManifestJson({ foo: "bar" }, { manifestUri: MANIFEST_ID })
    );

    await expect(promise).rejects.toBeInstanceOf(Error);
    await expect(promise).rejects.toMatchObject({
      message: "Unable to load IIIF resource",
      url: MANIFEST_ID,
    });
  });
});
