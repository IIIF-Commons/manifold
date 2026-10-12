import { loadManifestJson } from "../src";
import { ExternalResource } from "../src/ExternalResource";

const blAvAuthNew = require("./fixtures/bl-av-auth.json");

const INFO_URI = "https://example.org/iiif/image/1/info.json";
const LOGIN_PROFILE = "http://iiif.io/api/auth/1/login";
const LOGIN_URI = "https://example.org/login";
const VIDEO_URI = "https://example.org/video.mp4";

// Builds an info.json in each Image API version's shape. Auth 1 services keep
// `@id` in both, as Image API 3 requires for services from older specs.
interface ImageApi {
  info(id: string | null, options?: { login?: boolean; service?: any }): any;
}

const loginService = {
  "@context": "http://iiif.io/api/auth/1/context.json",
  "@id": LOGIN_URI,
  "@type": "AuthCookieService1",
  profile: LOGIN_PROFILE,
};

const image2: ImageApi = {
  info: (id, { login = false, service } = {}) => {
    const json: any = {
      "@context": "http://iiif.io/api/image/2/context.json",
      protocol: "http://iiif.io/api/image",
      width: 1000,
      height: 800,
      profile: ["http://iiif.io/api/image/2/level2.json"],
    };
    if (id) json["@id"] = id;
    if (service !== undefined) json.service = service;
    else if (login) json.service = [loginService];
    return json;
  },
};

const image3: ImageApi = {
  info: (id, { login = false, service } = {}) => {
    const json: any = {
      "@context": "http://iiif.io/api/image/3/context.json",
      type: "ImageService3",
      protocol: "http://iiif.io/api/image",
      width: 1000,
      height: 800,
      profile: "level2",
    };
    if (id) json.id = id;
    if (service !== undefined) json.service = service;
    else if (login) json.service = [loginService];
    return json;
  },
};

type MockXhr = {
  open: jest.Mock;
  send: jest.Mock;
  setRequestHeader: jest.Mock;
  status: number;
  responseText: string;
  timeout: number;
  withCredentials: boolean;
  onload?: () => void;
  onerror?: () => void;
  ontimeout?: () => void;
  onabort?: () => void;
};

const originalXhr = window.XMLHttpRequest;

function installXhr(): MockXhr {
  const xhr: MockXhr = {
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
    status: 0,
    responseText: "",
    timeout: 0,
    withCredentials: false,
  };
  // @ts-ignore
  window.XMLHttpRequest = jest.fn(() => xhr);
  return xhr;
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

// Completes the next getData() request with an HTTP response.
async function respondWith(
  resource: ExternalResource,
  status: number,
  body: string
): Promise<ExternalResource> {
  const xhr = installXhr();
  const promise = settle(resource.getData());
  xhr.status = status;
  xhr.responseText = body;
  xhr.onload!();
  return promise;
}

async function probedResource(): Promise<ExternalResource> {
  const helper = await loadManifestJson(blAvAuthNew, {
    manifestUri: blAvAuthNew.id,
  });
  return new ExternalResource(helper.getCanvasByIndex(0), {
    authApiVersion: 1,
  });
}

async function infoJsonResource(): Promise<ExternalResource> {
  const resource = await probedResource();
  resource.probeService = null;
  resource.dataUri = INFO_URI;
  return resource;
}

describe("ExternalResource.getData error handling", () => {
  afterEach(() => {
    window.XMLHttpRequest = originalXhr;
  });

  test("rejects with an Error when there is no dataUri", async () => {
    const resource = await infoJsonResource();
    resource.dataUri = null;

    const promise = settle(resource.getData());

    await expect(promise).rejects.toBeInstanceOf(Error);
    await expect(promise).rejects.toMatchObject({
      message: "There is no dataUri to fetch",
    });
  });

  test("resolves with an invalid-json error when the probe response is not JSON", async () => {
    const resource = await probedResource();
    const probeUri = resource.probeService!.id;
    const xhr = installXhr();

    const promise = settle(resource.getData());
    xhr.status = 200;
    xhr.responseText = "<html>Login</html>";
    xhr.onload!();

    await expect(promise).resolves.toBe(resource);
    expect(resource.status).toBe(200);
    expect(resource.error).toBeInstanceOf(Error);
    expect(resource.error).toMatchObject({
      url: probeUri,
      reason: "invalid-json",
    });
  });

  test("resolves with an invalid-json error when info.json is not JSON", async () => {
    const resource = await infoJsonResource();
    const xhr = installXhr();

    const promise = settle(resource.getData());
    xhr.status = 200;
    xhr.responseText = "<html>Proxy error</html>";
    xhr.onload!();

    await expect(promise).resolves.toBe(resource);
    expect(resource.status).toBe(200);
    expect(resource.error).toBeInstanceOf(Error);
    expect(resource.error).toMatchObject({
      url: INFO_URI,
      reason: "invalid-json",
    });
  });

  test.each(["null", "42", '"text"'])(
    "resolves with an invalid-json error when the probe response is %s",
    async (body) => {
      const resource = await probedResource();
      const xhr = installXhr();

      const promise = settle(resource.getData());
      xhr.status = 200;
      xhr.responseText = body;
      xhr.onload!();

      await expect(promise).resolves.toBe(resource);
      expect(resource.error).toMatchObject({ reason: "invalid-json" });
    }
  );

  test.each(["null", "42", '"text"'])(
    "resolves with an invalid-json error when info.json is %s",
    async (body) => {
      const resource = await infoJsonResource();
      const xhr = installXhr();

      const promise = settle(resource.getData());
      xhr.status = 200;
      xhr.responseText = body;
      xhr.onload!();

      await expect(promise).resolves.toBe(resource);
      expect(resource.error).toMatchObject({ reason: "invalid-json" });
    }
  );

  test("resolves with a network error when the request fails with a non-JSON body", async () => {
    const resource = await infoJsonResource();
    const xhr = installXhr();

    const promise = settle(resource.getData());
    xhr.status = 0;
    xhr.responseText = "<html>Bad gateway</html>";
    xhr.onerror!();

    await expect(promise).resolves.toBe(resource);
    expect(resource.status).toBe(0);
    expect(resource.error).toBeInstanceOf(Error);
    expect(resource.error).toMatchObject({ url: INFO_URI, reason: "network" });
  });

  test("resolves with a network error when the probe request fails", async () => {
    const resource = await probedResource();
    const probeUri = resource.probeService!.id;
    const xhr = installXhr();

    const promise = settle(resource.getData());
    xhr.onerror!();

    await expect(promise).resolves.toBe(resource);
    expect(resource.status).toBe(0);
    expect(resource.error).toMatchObject({ url: probeUri, reason: "network" });
  });

  test.each(["timeout", "abort"])(
    "resolves with a %s error when the request is cut short",
    async (reason) => {
      const resource = await infoJsonResource();
      const xhr = installXhr();

      const promise = settle(resource.getData());
      const handler = reason === "timeout" ? xhr.ontimeout : xhr.onabort;
      expect(handler).toBeDefined();
      handler!();

      await expect(promise).resolves.toBe(resource);
      expect(resource.status).toBe(0);
      expect(resource.error).toBeInstanceOf(Error);
      expect(resource.error).toMatchObject({ url: INFO_URI, reason });
    }
  );

  test.each(["timeout", "abort"])(
    "resolves with a %s error when the probe request is cut short",
    async (reason) => {
      const resource = await probedResource();
      const probeUri = resource.probeService!.id;
      const xhr = installXhr();

      const promise = settle(resource.getData());
      const handler = reason === "timeout" ? xhr.ontimeout : xhr.onabort;
      expect(handler).toBeDefined();
      handler!();

      await expect(promise).resolves.toBe(resource);
      expect(resource.status).toBe(0);
      expect(resource.error).toMatchObject({ url: probeUri, reason });
    }
  );

  test("does not set a request timeout by default", async () => {
    const resource = await infoJsonResource();
    const xhr = installXhr();

    resource.getData();

    expect(resource.timeout).toBe(0);
    expect(xhr.timeout).toBe(0);
  });

  test("applies the timeout property to the request", async () => {
    const resource = await infoJsonResource();
    resource.timeout = 5000;
    const xhr = installXhr();

    resource.getData();

    expect(xhr.timeout).toBe(5000);
  });

});

// A v3 manifest with one video canvas; `login` adds an Auth 1 login service.
function videoManifest(login: boolean): any {
  const body: any = {
    id: VIDEO_URI,
    type: "Video",
    format: "video/mp4",
  };
  if (login) {
    body.service = [loginService];
  }
  return {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: "https://example.org/iiif/manifest/video",
    type: "Manifest",
    label: { en: ["Video"] },
    items: [
      {
        id: "https://example.org/iiif/canvas/1",
        type: "Canvas",
        width: 640,
        height: 480,
        duration: 10,
        items: [
          {
            id: "https://example.org/iiif/canvas/1/page",
            type: "AnnotationPage",
            items: [
              {
                id: "https://example.org/iiif/canvas/1/page/anno",
                type: "Annotation",
                motivation: "painting",
                target: "https://example.org/iiif/canvas/1",
                body,
              },
            ],
          },
        ],
      },
    ],
  };
}

async function videoResource(login: boolean): Promise<ExternalResource> {
  const json = videoManifest(login);
  const helper = await loadManifestJson(json, { manifestUri: json.id });
  return new ExternalResource(helper.getCanvasByIndex(0), {
    authApiVersion: 1,
  });
}

describe("ExternalResource.getData successful loading", () => {
  const TOKEN = { accessToken: "abc123", expiresIn: 3600 } as any;

  afterEach(() => {
    window.XMLHttpRequest = originalXhr;
  });

  test("requests the probe service with a GET", async () => {
    const resource = await probedResource();
    const xhr = installXhr();

    resource.getData();

    expect(resource.isProbed).toBe(true);
    expect(xhr.open).toHaveBeenCalledWith(
      "GET",
      resource.probeService!.id,
      true
    );
    expect(xhr.withCredentials).toBe(false);
    expect(xhr.setRequestHeader).not.toHaveBeenCalled();
  });

  test("sends the access token to the probe service", async () => {
    const resource = await probedResource();
    const xhr = installXhr();

    resource.getData(TOKEN);

    expect(xhr.setRequestHeader).toHaveBeenCalledWith(
      "Authorization",
      "Bearer abc123"
    );
  });

  test("resolves with the probe data when the probe succeeds", async () => {
    const resource = await probedResource();
    const body = { contentLocation: resource.dataUri };

    await expect(
      respondWith(resource, 200, JSON.stringify(body))
    ).resolves.toBe(resource);
    expect(resource.status).toBe(200);
    expect(resource.error).toBeUndefined();
    expect(resource.data).toEqual(body);
  });

  test("requests info.json with a GET", async () => {
    const resource = await infoJsonResource();
    const xhr = installXhr();

    resource.getData();

    expect(xhr.open).toHaveBeenCalledWith("GET", INFO_URI, true);
    expect(xhr.withCredentials).toBe(false);
  });

  test("sends the access token with the info.json request", async () => {
    const resource = await infoJsonResource();
    const xhr = installXhr();

    resource.getData(TOKEN);

    expect(xhr.setRequestHeader).toHaveBeenCalledWith(
      "Authorization",
      "Bearer abc123"
    );
  });

  test("resolves with 200 without a request when the resource is not access controlled", async () => {
    const resource = await videoResource(false);
    const xhr = installXhr();

    await expect(settle(resource.getData())).resolves.toBe(resource);

    expect(resource.dataUri).toBe(VIDEO_URI);
    expect(resource.status).toBe(200);
    expect(resource.error).toBeUndefined();
    expect(xhr.open).not.toHaveBeenCalled();
  });

  test("checks an access-controlled resource with a HEAD request", async () => {
    const resource = await videoResource(true);
    const xhr = installXhr();

    const promise = settle(resource.getData(TOKEN));
    expect(xhr.open).toHaveBeenCalledWith("HEAD", VIDEO_URI, true);
    expect(xhr.setRequestHeader).toHaveBeenCalledWith(
      "Authorization",
      "Bearer abc123"
    );
    xhr.status = 200;
    xhr.responseText = "";
    xhr.onload!();

    await expect(promise).resolves.toBe(resource);
    expect(resource.status).toBe(200);
    expect(resource.error).toBeUndefined();
  });
});

describe("ExternalResource.getData HTTP status handling", () => {
  const HTML = "<html>Unauthorized</html>";

  afterEach(() => {
    window.XMLHttpRequest = originalXhr;
  });

  test.each([
    [401, "HTML", HTML],
    [401, "empty", ""],
    [403, "HTML", HTML],
    [403, "empty", ""],
  ])(
    "resolves with an http error when the probe returns %i with an %s body",
    async (status, _kind, body) => {
      const resource = await probedResource();
      const probeUri = resource.probeService!.id;

      await expect(respondWith(resource, status, body)).resolves.toBe(
        resource
      );
      expect(resource.status).toBe(status);
      expect(resource.error).toBeInstanceOf(Error);
      expect(resource.error).toMatchObject({ url: probeUri, reason: "http" });
    }
  );

  test.each([401, 403])(
    "resolves with an http error and keeps the data when the probe returns %i with a JSON body",
    async (status) => {
      const resource = await probedResource();
      const probeUri = resource.probeService!.id;
      const body = { heading: "Access denied" };

      await respondWith(resource, status, JSON.stringify(body));

      expect(resource.status).toBe(status);
      expect(resource.error).toMatchObject({ url: probeUri, reason: "http" });
      expect(resource.data).toEqual(body);
    }
  );

  test("reports 200 when a successful probe has no contentLocation", async () => {
    const resource = await probedResource();

    await respondWith(resource, 200, JSON.stringify({}));

    expect(resource.status).toBe(200);
    expect(resource.error).toBeUndefined();
  });

  test("reports 200 when a successful probe's contentLocation matches the dataUri", async () => {
    const resource = await probedResource();

    await respondWith(
      resource,
      200,
      JSON.stringify({ contentLocation: resource.dataUri })
    );

    expect(resource.status).toBe(200);
  });

  test("reports tiered access (302) when a successful probe's contentLocation differs", async () => {
    const resource = await probedResource();

    await respondWith(
      resource,
      200,
      JSON.stringify({ contentLocation: "https://example.org/lower-tier.mp4" })
    );

    expect(resource.status).toBe(302);
  });

  test.each([401, 403])(
    "resolves with an http error when info.json returns %i with an HTML body",
    async (status) => {
      const resource = await infoJsonResource();

      await respondWith(resource, status, HTML);

      expect(resource.status).toBe(status);
      expect(resource.error).toMatchObject({ url: INFO_URI, reason: "http" });
    }
  );

  test("resolves with an http error when info.json returns 401 with an empty body", async () => {
    const resource = await infoJsonResource();

    await respondWith(resource, 401, "");

    expect(resource.status).toBe(401);
    expect(resource.error).toMatchObject({ url: INFO_URI, reason: "http" });
  });
});

describe.each([
  ["Image API 2", image2],
  ["Image API 3", image3],
])("ExternalResource.getData info.json handling (%s)", (_name, imageApi) => {
  const IMAGE_URI = INFO_URI.replace("/info.json", "");

  afterEach(() => {
    window.XMLHttpRequest = originalXhr;
  });

  async function respond(
    resource: ExternalResource,
    body: any
  ): Promise<ExternalResource> {
    const xhr = installXhr();
    const promise = settle(resource.getData());
    xhr.status = 200;
    xhr.responseText = JSON.stringify(body);
    xhr.onload!();
    return promise;
  }

  test("resolves with the info.json data and dimensions", async () => {
    const resource = await infoJsonResource();
    const info = imageApi.info(IMAGE_URI);

    await expect(respond(resource, info)).resolves.toBe(resource);
    expect(resource.status).toBe(200);
    expect(resource.error).toBeUndefined();
    expect(resource.data).toEqual(info);
    expect(resource.width).toBe(1000);
    expect(resource.height).toBe(800);
  });

  test("finds the login service", async () => {
    const resource = await infoJsonResource();

    await respond(resource, imageApi.info(IMAGE_URI, { login: true }));

    expect(resource.loginService).not.toBe(null);
    expect(resource.loginService!.id).toBe(LOGIN_URI);
  });

  test("does not report tiered access when the id matches the request", async () => {
    const resource = await infoJsonResource();

    await respond(resource, imageApi.info(IMAGE_URI, { login: true }));

    expect(resource.status).toBe(200);
  });

  test("does not report tiered access when the id ends in /info.json", async () => {
    const resource = await infoJsonResource();

    await respond(resource, imageApi.info(INFO_URI, { login: true }));

    expect(resource.status).toBe(200);
  });

  test("reports tiered access (302) when the id differs and there is a login service", async () => {
    const resource = await infoJsonResource();

    await respond(
      resource,
      imageApi.info("https://example.org/iiif/image/1-lower-tier", {
        login: true,
      })
    );

    expect(resource.status).toBe(302);
  });

  test("does not report tiered access when the id differs but there is no login service", async () => {
    const resource = await infoJsonResource();

    await respond(
      resource,
      imageApi.info("https://example.org/iiif/image/1-lower-tier")
    );

    expect(resource.status).toBe(200);
  });

  test("does not report tiered access when info.json has no id", async () => {
    const resource = await infoJsonResource();

    await respond(resource, imageApi.info(null, { login: true }));

    expect(resource.loginService).not.toBe(null);
    expect(resource.status).toBe(200);
  });

  test("resolves with an http error and still finds the login service when info.json returns 401", async () => {
    const resource = await infoJsonResource();
    const info = imageApi.info(IMAGE_URI, { login: true });

    await respondWith(resource, 401, JSON.stringify(info));

    expect(resource.status).toBe(401);
    expect(resource.error).toMatchObject({ url: INFO_URI, reason: "http" });
    expect(resource.loginService!.id).toBe(LOGIN_URI);
    expect(resource.data).toEqual(info);
  });

  test("resolves with an http error when a 401 info.json's services cannot be read", async () => {
    const resource = await infoJsonResource();

    await respondWith(
      resource,
      401,
      JSON.stringify(imageApi.info(IMAGE_URI, { service: "login" }))
    );

    expect(resource.status).toBe(401);
    expect(resource.error).toMatchObject({ url: INFO_URI, reason: "http" });
  });

  test("resolves with an invalid-json error when info.json services cannot be read", async () => {
    const resource = await infoJsonResource();

    await expect(
      respond(resource, imageApi.info(IMAGE_URI, { service: "login" }))
    ).resolves.toBe(resource);
    expect(resource.status).toBe(200);
    expect(resource.error).toMatchObject({
      url: INFO_URI,
      reason: "invalid-json",
    });
  });

  test("clears the previous error when a retry succeeds", async () => {
    const resource = await infoJsonResource();
    const failing = installXhr();
    const first = settle(resource.getData());
    failing.onerror!();
    await first;

    await respond(resource, imageApi.info(IMAGE_URI));

    expect(resource.status).toBe(200);
    expect(resource.error).toBeUndefined();
  });
});
