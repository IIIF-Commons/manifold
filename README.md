# manifold

[![Build Status](https://github.com/IIIF-Commons/manifold/actions/workflows/build-test.yml/badge.svg?branch=main)](https://github.com/IIIF-Commons/manifold/actions/workflows/build-test.yml)

    npm install @iiif/manifold --save

Stateful utils on top of manifesto. Returns a `helper` object that can be used to navigate a IIIF manifest.

e.g.

- `getMetadata`: returns all metadata for current image, range, canvas, sequence, manifest)
- `getCurrentRange`, `getPreviousRange`, `getNextRange`: Used to navigate a flattened range tree (useful for IIIF AV scenarios)
- `getTree`: Returns a default tree (sortable by `navDate`) of collections, manifests, ranges, or a tree based on a given top range.

Has an ajax implementation of manifesto's `IExternalResource` (used in the IIIF auth flow).

## Getting Started

### Documentation

https://iiif-commons.github.io/manifold/

### Developer Setup

    git clone https://github.com/iiif-commons/manifold.git
    npm install
    npm run build

### Testing the build
The build can be run and tested in the browser console by running

    npm start

and navigating to examples/index.html.

### Publishing Package

    git checkout main
    npm version patch
    npm run docs
    git add .
    git commit -m "Release v1.2.3"
    git tag v1.2.3
    git push origin main v1.2.3

## Error handling

`loadManifest()` and `loadManifestJson()` reject with an `Error` when loading fails, including when a child manifest or sub-collection fails, an index doesn't exist, the JSON isn't a IIIF resource, or collections contain themselves or are nested more than 10 deep. Errors from manifesto are passed through unchanged.

| Property   | When it's set                                           |
| ---------- | ------------------------------------------------------- |
| `message`  | Always                                                  |
| `url`      | The URL that failed; may be a child resource            |
| `status`   | HTTP errors only (e.g. `404`)                           |
| `response` | HTTP errors only; the raw `Response`                    |
| `index`    | Missing `manifestIndex` / `collectionIndex` errors only |

```ts
try {
  const helper = await loadManifest({ manifestUri });
} catch (err: any) {
  showMessage(
    err?.status === 404 ? "Manifest not found." : "Unable to load manifest."
  );
}
```

Older versions of manifesto may reject with `undefined`, so read errors defensively.

`ExternalResource.getData()` resolves rather than rejects when a request fails. It rejects only when there is no `dataUri` to fetch. After it resolves, check `status` and `error`.

`status` is one of:

- the HTTP status of the response;
- `302` when the server returned a lower tier of [tiered access](https://iiif.io/api/auth/1.0/#tiered-access) (for example a lower-resolution image) and there is a login service for the full version. This is set by Manifold, not by the server: the browser follows real redirects without reporting them;
- `0` when no HTTP response arrived (network failure, CORS, timeout or abort).

`error` is `undefined` on success. Otherwise it is an `Error` with `url` and `reason`:

| `reason`         | When it's set                                                                |
| ---------------- | ---------------------------------------------------------------------------- |
| `"http"`         | The response had a non-2xx status, such as `401` for an invalid access token |
| `"invalid-json"` | The response had a 2xx status, but the body wasn't a usable JSON object      |
| `"network"`      | No response arrived (network failure or CORS)                                |
| `"timeout"`      | The request took longer than `timeout`                                       |
| `"abort"`        | The request was aborted                                                      |

`error` is reset at the start of each `getData()` call, so a retry that succeeds clears it.

Authentication is a separate check from `error`. A `401` sets `error` with `reason: "http"`, but its body is still read: login and other auth services are parsed into properties such as `loginService`, and the body is stored in `data`. Check for auth before treating `error` as a failure:

```ts
await resource.getData(accessToken);

if (resource.status === 401 && resource.isAccessControlled()) {
  showLogin(resource.loginService);
} else if (resource.error) {
  showMessage(
    `Unable to load ${resource.error.url} (${resource.error.reason}).`
  );
}
```

manifesto's auth flow only reads `status`, so it is not affected by `error`.

Set `timeout` (milliseconds) before calling `getData()` to limit how long a request may take. The default `0` means no timeout.

## IIIF Auth

Manifold supports the [IIIF Authentication API 1.0](https://iiif.io/api/auth/1.0/). Pass `authApiVersion: 0.9` to `ExternalResource` for servers that still use the older 0.9 services. Auth API 2.0 is not supported.

Manifold doesn't run the login flow itself. `ExternalResource` finds a resource's auth services and checks whether the user can access it. manifesto's `Utils.loadExternalResourcesAuth1()` runs the flow and calls back into your viewer to open login windows and fetch tokens.

### What the manifest needs

Manifold looks at the first painting annotation on each canvas and the first body of that annotation (the first item if the body is a `Choice`). Content in other annotations or bodies isn't checked.

- **Images:** if that body has an image service, Manifold requests `{service id}/info.json`. Put the auth services in the `info.json`, not the manifest.
- **Everything else** (audio, video, PDFs): Manifold uses the body's `id`. Put the auth services on the body in the manifest.

Services are matched by `profile`:

| Service       | `profile`                                | Where it goes                                                         |
| ------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| Click-through | `http://iiif.io/api/auth/1/clickthrough` | On the body or in the `info.json`                                     |
| Login         | `http://iiif.io/api/auth/1/login`        | On the body or in the `info.json`                                     |
| External      | `http://iiif.io/api/auth/1/external`     | On the body or in the `info.json`                                     |
| Kiosk         | `http://iiif.io/api/auth/1/kiosk`        | On the body or in the `info.json`                                     |
| Token         | `http://iiif.io/api/auth/1/token`        | Inside the click-through, login, external or kiosk service            |
| Logout        | `http://iiif.io/api/auth/1/logout`       | Inside the click-through, login, external or kiosk service            |
| Probe         | `http://iiif.io/api/auth/1/probe`        | On the body (inside the access service also works, but is deprecated) |

Give each resource one access service (click-through, login, external or kiosk), and give that service a token service, or the user can't be granted access. The probe isn't part of the Auth 1.0 spec: it's an extension used by the British Library and the Universal Viewer (`AuthProbeService1`), and Auth 2.0 later standardised a different probe. A probe is only used alongside an access service; on its own it's ignored. In Presentation 3 you can declare a service once in the manifest's top-level `services` and refer to it by `id` from each body.

An audio body with a login service and a probe:

```json
{
  "id": "https://example.org/media/recording.mpd",
  "type": "Sound",
  "format": "application/dash+xml",
  "service": [
    {
      "id": "https://example.org/auth/login",
      "type": "AuthCookieService1",
      "profile": "http://iiif.io/api/auth/1/login",
      "label": "Log in to Example Library",
      "service": [
        {
          "id": "https://example.org/auth/token",
          "type": "AuthTokenService1",
          "profile": "http://iiif.io/api/auth/1/token"
        }
      ]
    },
    {
      "id": "https://example.org/media/recording/probe.json",
      "type": "AuthProbeService1",
      "profile": "http://iiif.io/api/auth/1/probe"
    }
  ]
}
```

### How access is checked

`ExternalResource.getData(accessToken?)` makes at most one request, depending on what the resource has:

| Resource                               | Request               | Result                                                                                                                            |
| -------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Has a probe service                    | `GET` the probe       | `302` if a successful probe's `contentLocation` differs from the content's URL; otherwise the response status                     |
| Has an image service                   | `GET` the `info.json` | Auth services are read from the body, even on a `401`. `302` if the `info.json` `id` differs and there's a login or kiosk service |
| Other, with no auth services           | None                  | `200`                                                                                                                             |
| Other, with auth services but no probe | `HEAD` the content    | The response status                                                                                                               |

`302` is Manifold's marker for [tiered access](https://iiif.io/api/auth/1.0/#tiered-access), not a real HTTP redirect. See [Error handling](#error-handling) for `status` and `error`.

When an access token is given, it's sent as `Authorization: Bearer <token>`. Requests are made without credentials, so cookies are never sent to the probe, `info.json` or content: access depends on the token alone.

### The flow

`Utils.loadExternalResourcesAuth1()` runs these steps for each resource:

1. **With a stored token:** call `getData(token)`. A `200` means done. Anything else runs the auth chain.
2. **Without a stored token:** call `getData()`. A `302` or `401` runs the auth chain. Any other status skips it.
3. **Auth chain:**
   - A `302` that hasn't been handled yet calls your `handleMovedTemporarily` callback, so the viewer can show the lower tier and offer a login. To log in, set `resource.isResponseHandled = true` and load the resource again.
   - Otherwise it tries the services in this order: external, kiosk, click-through, login. For each, it opens the interaction (a login window, for example), waits for the user, gets a token from the token service and calls `getData(token)` again.
   - If nothing worked, it calls `showOutOfOptionsMessages` with the last service it tried, so you can show that service's failure messages.
4. **Result:** a final status of `200` or `302` returns the resource. Anything else, including `403`, rejects with an authorization-failed error.

### What servers should return

- **Probe:** a JSON object. On success use a `2xx` status, and include `contentLocation` if the user will get a different version from the content's URL. Use `401` when the user needs to log in.
- **`info.json`:** a `401` with the full `info.json` (including its auth services) when the user needs to log in, or a `200` with a different `id` for a lower tier.
- **`403`:** use only when logging in won't help. The flow doesn't offer a login for it.
- **CORS:** allow the `Authorization` request header on the probe, `info.json` and content, so the token can be sent.
