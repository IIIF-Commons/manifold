import { ServiceProfile } from "@iiif/vocabulary/dist-commonjs";
import * as HTTPStatusCode from "@edsilv/http-status-codes";
import {
  Annotation,
  AnnotationBody,
  Canvas,
  IAccessToken,
  IExternalResource,
  IExternalResourceOptions,
  Resource,
  Service,
  Utils,
} from "manifesto.js";

// Returns null for invalid JSON and for JSON that isn't an object (e.g. `null`, `42`).
function parseJsonObject(text: string): any | null {
  try {
    const data = JSON.parse(text);
    return data !== null && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

function isSuccess(status: number): boolean {
  return status >= 200 && status < 300;
}

// An unusable body on an HTTP error is reported as the HTTP error, not bad JSON.
function unusableBodyReason(status: number): "invalid-json" | "http" {
  return isSuccess(status) ? "invalid-json" : "http";
}

export class ExternalResource implements IExternalResource {
  public authAPIVersion: number;
  public authHoldingPage: any = null;
  public clickThroughService: Service | null = null;
  public data: any;
  public dataUri: string | null;
  public error: any;
  public externalService: Service | null = null;
  public height: number;
  public index: number;
  public isProbed: boolean = false;
  public isResponseHandled: boolean = false;
  public kioskService: Service | null = null;
  public loginService: Service | null = null;
  public logoutService: Service | null = null;
  public probeService: Service | null = null;
  public restrictedService: Service | null = null;
  public status: number;
  public timeout: number = 0;
  public tokenService: Service | null = null;
  public width: number;

  constructor(canvas: Canvas, options: IExternalResourceOptions) {
    canvas.externalResource = <ExternalResource>this;
    this.dataUri = this._getDataUri(canvas);
    this.index = canvas.index;
    this.authAPIVersion = options.authApiVersion;
    this._parseAuthServices(canvas);
    // get the height and width of the image resource if available
    this._parseCanvasDimensions(canvas);
  }

  private _getImageServiceDescriptor(services: Service[]): string | null {
    let infoUri: string | null = null;

    for (let i = 0; i < services.length; i++) {
      const service: Service = services[i];
      let id: string = service.id;

      if (!id.endsWith("/")) {
        id += "/";
      }
      if (
        service.getProfile() &&
        (Utils.isImageProfile(service.getProfile()) ||
          Utils.isImageServiceType(service.getIIIFResourceType()))
      ) {
        infoUri = id + "info.json";
      }
    }

    return infoUri;
  }

  private _getDataUri(canvas: Canvas): string | null {
    const content: Annotation[] = canvas.getContent();
    const images: Annotation[] = canvas.getImages();
    let infoUri: string | null = null;

    // presentation 3
    if (content && content.length) {
      const annotation: Annotation = content[0];
      const annotationBody: AnnotationBody[] = annotation.getBody();

      if (annotationBody.length) {
        const body: AnnotationBody = annotationBody[0];
        const services: Service[] = body.getServices();

        if (services.length) {
          infoUri = this._getImageServiceDescriptor(services);
          if (infoUri) {
            return infoUri;
          }
        }

        // no image services. return the image id
        return annotationBody[0].id;
      }

      return null;
    } else if (images && images.length) {
      // presentation 2

      const firstImage: Annotation = images[0];
      const resource: Resource = firstImage.getResource();
      const services: Service[] = resource.getServices();

      if (services.length) {
        infoUri = this._getImageServiceDescriptor(services);
        if (infoUri) {
          return infoUri;
        }
      }

      // no image services. return the image id
      return resource.id;
    } else {
      // Legacy IxIF
      const service: Service | null = canvas.getService(ServiceProfile.IXIF);

      if (service) {
        // todo: deprecate
        return service.getInfoUri();
      }

      // return the canvas id.
      return canvas.id;
    }
  }

  private _parseAuthServices(resource: any): void {
    if (this.authAPIVersion === 0.9) {
      this.clickThroughService = Utils.getService(
        resource,
        ServiceProfile.AUTH_0_CLICK_THROUGH
      );
      this.loginService = Utils.getService(
        resource,
        ServiceProfile.AUTH_0_LOGIN
      );
      this.restrictedService = Utils.getService(
        resource,
        ServiceProfile.AUTH_0_RESTRICTED
      );

      if (this.clickThroughService) {
        this.logoutService = this.clickThroughService.getService(
          ServiceProfile.AUTH_0_LOGOUT
        );
        this.tokenService = this.clickThroughService.getService(
          ServiceProfile.AUTH_0_TOKEN
        );
      } else if (this.loginService) {
        this.logoutService = this.loginService.getService(
          ServiceProfile.AUTH_0_LOGOUT
        );
        this.tokenService = this.loginService.getService(
          ServiceProfile.AUTH_0_TOKEN
        );
      } else if (this.restrictedService) {
        this.logoutService = this.restrictedService.getService(
          ServiceProfile.AUTH_0_LOGOUT
        );
        this.tokenService = this.restrictedService.getService(
          ServiceProfile.AUTH_0_TOKEN
        );
      }
    } else {
      // auth 1

      // if the resource is a canvas, not an info.json, look for auth services on its content.
      if (resource.isCanvas !== undefined && resource.isCanvas()) {
        const content: Annotation[] = (<Canvas>resource).getContent();

        if (content && content.length) {
          const body: AnnotationBody[] = content[0].getBody();

          if (body && body.length) {
            const annotation: AnnotationBody = body[0];
            resource = annotation;
          }
        }
      }

      this.clickThroughService = Utils.getService(
        resource,
        ServiceProfile.AUTH_1_CLICK_THROUGH
      );
      this.loginService = Utils.getService(
        resource,
        ServiceProfile.AUTH_1_LOGIN
      );
      this.externalService = Utils.getService(
        resource,
        ServiceProfile.AUTH_1_EXTERNAL
      );
      this.kioskService = Utils.getService(
        resource,
        ServiceProfile.AUTH_1_KIOSK
      );

      if (this.clickThroughService) {
        this.logoutService = this.clickThroughService.getService(
          ServiceProfile.AUTH_1_LOGOUT
        );
        this.tokenService = this.clickThroughService.getService(
          ServiceProfile.AUTH_1_TOKEN
        );
        this.probeService = this.clickThroughService.getService(
          ServiceProfile.AUTH_1_PROBE
        );
      } else if (this.loginService) {
        this.logoutService = this.loginService.getService(
          ServiceProfile.AUTH_1_LOGOUT
        );
        this.tokenService = this.loginService.getService(
          ServiceProfile.AUTH_1_TOKEN
        );

        this.probeService = Utils.getService(
          resource,
          ServiceProfile.AUTH_1_PROBE
        );

        // @deprecated - the probe should be on the resource.
        if (!this.probeService) {
          this.probeService = this.loginService.getService(
            ServiceProfile.AUTH_1_PROBE
          );
        }
      } else if (this.externalService) {
        this.logoutService = this.externalService.getService(
          ServiceProfile.AUTH_1_LOGOUT
        );
        this.tokenService = this.externalService.getService(
          ServiceProfile.AUTH_1_TOKEN
        );
        this.probeService = Utils.getService(
          resource,
          ServiceProfile.AUTH_1_PROBE
        );

        // @deprecated - the probe should be on the resource.
        if (!this.probeService) {
          this.probeService = this.externalService.getService(
            ServiceProfile.AUTH_1_PROBE
          );
        }
      } else if (this.kioskService) {
        this.logoutService = this.kioskService.getService(
          ServiceProfile.AUTH_1_LOGOUT
        );
        this.tokenService = this.kioskService.getService(
          ServiceProfile.AUTH_1_TOKEN
        );
        this.probeService = Utils.getService(
          resource,
          ServiceProfile.AUTH_1_PROBE
        );

        // @deprecated - the probe should be on the resource.
        if (!this.probeService) {
          this.probeService = this.kioskService.getService(
            ServiceProfile.AUTH_1_PROBE
          );
        }
      }
    }
  }

  private _parseCanvasDimensions(canvas: Canvas): void {
    let images: Annotation[] = canvas.getImages();

    if (images && images.length) {
      const firstImage = images[0];
      const resource: Resource = firstImage.getResource();

      this.width = resource.getWidth();
      this.height = resource.getHeight();
    } else {
      // presentation 3
      images = canvas.getContent();

      if (images.length) {
        const annotation: Annotation = images[0];
        const body: AnnotationBody[] = annotation.getBody();

        if (body.length) {
          this.width = body[0].getWidth();
          this.height = body[0].getHeight();
        }
      }
    }
  }

  private _parseDescriptorDimensions(descriptor): void {
    if (descriptor.width !== undefined) {
      this.width = descriptor.width;
    }
    if (descriptor.height !== undefined) {
      this.height = descriptor.height;
    }
  }

  private _resolveWithError(
    xhr: XMLHttpRequest,
    url: string,
    reason: "invalid-json" | "http" | "network" | "timeout" | "abort",
    resolve: (resource: ExternalResource) => void
  ): void {
    this._setError(xhr, url, reason);
    resolve(this);
  }

  private _setError(
    xhr: XMLHttpRequest,
    url: string,
    reason: "invalid-json" | "http" | "network" | "timeout" | "abort"
  ): void {
    const messages = {
      "invalid-json": "Invalid JSON response",
      http: "HTTP error",
      network: "Network error",
      timeout: "Request timed out",
      abort: "Request aborted",
    };
    const error: any = new Error(messages[reason]);
    error.url = url;
    error.reason = reason;
    this.status = xhr.status;
    this.error = error;
  }

  public isAccessControlled(): boolean {
    if (
      this.clickThroughService ||
      this.loginService ||
      this.externalService ||
      this.kioskService ||
      this.probeService
    ) {
      return true;
    }
    return false;
  }

  public hasServiceDescriptor(): boolean {
    if (this.dataUri) {
      return this.dataUri.endsWith("info.json");
    }

    return false;
  }

  public getData(accessToken?: IAccessToken): Promise<ExternalResource> {
    const that = this;
    that.data = {};
    that.error = undefined;

    return new Promise<ExternalResource>((resolve, reject) => {
      if (!that.dataUri) {
        reject(new Error("There is no dataUri to fetch"));
        return;
      }

      // console.log("getData (manifold)");

      // if the resource has a probe service, use that to get http status code
      if (that.probeService) {
        that.isProbed = true;

        const probeUri: string = that.probeService.id;
        const xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open("GET", probeUri, true);
        // This has been disabled as the request should use the access token.
        xhr.withCredentials = false;
        xhr.timeout = that.timeout;

        if (accessToken) {
          xhr.setRequestHeader(
            "Authorization",
            "Bearer " + accessToken.accessToken
          );
        }

        xhr.onload = () => {
          const data = parseJsonObject(xhr.responseText);
          if (!data) {
            that._resolveWithError(
              xhr,
              probeUri,
              unusableBodyReason(xhr.status),
              resolve
            );
            return;
          }

          that.status = xhr.status;

          if (!isSuccess(xhr.status)) {
            that._setError(xhr, probeUri, "http");
          } else if (
            // Only a successful probe can point at a lower tier of tiered access.
            data.contentLocation &&
            unescape(data.contentLocation) !== that.dataUri
          ) {
            that.status = HTTPStatusCode.MOVED_TEMPORARILY;
          }

          that.data = data;

          resolve(that);
        };

        xhr.onerror = () =>
          that._resolveWithError(xhr, probeUri, "network", resolve);
        xhr.ontimeout = () =>
          that._resolveWithError(xhr, probeUri, "timeout", resolve);
        xhr.onabort = () =>
          that._resolveWithError(xhr, probeUri, "abort", resolve);

        xhr.send();
      } else {
        // check if dataUri ends with info.json
        // if not issue a HEAD request.

        let type: string = "GET";

        if (!that.hasServiceDescriptor()) {
          // If access control is unnecessary, short circuit the process.
          // Note that isAccessControlled check for short-circuiting only
          // works in the "binary resource" context, since in that case,
          // we know about access control from the manifest. For image
          // resources, we need to check info.json for details and can't
          // short-circuit like this.
          if (!that.isAccessControlled()) {
            that.status = HTTPStatusCode.OK;
            resolve(that);
            return;
          }
          type = "HEAD";
        }

        const dataUri: string = that.dataUri;
        const xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open(type, dataUri, true);
        xhr.withCredentials = false;
        xhr.timeout = that.timeout;
        if (accessToken) {
          xhr.setRequestHeader(
            "Authorization",
            "Bearer " + accessToken.accessToken
          );
        }

        xhr.onload = () => {
          // if it's a resource without an info.json
          // todo: if resource doesn't have a @profile
          if (!xhr.responseText) {
            that.status = xhr.status || HTTPStatusCode.OK;
            if (!isSuccess(that.status)) {
              that._setError(xhr, dataUri, "http");
            }
            resolve(that);
          } else {
            const data = parseJsonObject(xhr.responseText);
            if (!data) {
              that._resolveWithError(
                xhr,
                dataUri,
                unusableBodyReason(xhr.status),
                resolve
              );
              return;
            }
            const status = xhr.status;
            const id: string | undefined = data["@id"] || data.id;
            let uri: string | null = id ? unescape(id) : null;

            that.data = data;
            try {
              that._parseAuthServices(that.data);
            } catch {
              that._resolveWithError(
                xhr,
                dataUri,
                unusableBodyReason(status),
                resolve
              );
              return;
            }
            that._parseDescriptorDimensions(that.data);

            // remove trailing /info.json
            if (uri && uri.endsWith("/info.json")) {
              uri = uri.substr(0, uri.lastIndexOf("/"));
            }

            let baseUri: string = dataUri;

            if (baseUri.endsWith("/info.json")) {
              baseUri = baseUri.substr(0, baseUri.lastIndexOf("/"));
            }

            // if the request was redirected to a lower tier of tiered access and there's a login service to get the full version
            if (
              status === HTTPStatusCode.OK &&
              uri !== null &&
              uri !== baseUri &&
              (that.loginService || that.kioskService)
            ) {
              that.status = HTTPStatusCode.MOVED_TEMPORARILY;
            } else {
              that.status = status;
            }

            if (!isSuccess(status)) {
              that._setError(xhr, dataUri, "http");
            }

            resolve(that);
          }
        };

        xhr.onerror = () => {
          const data = parseJsonObject(xhr.responseText);
          if (data) {
            try {
              that._parseAuthServices(data);
            } catch {
              // Auth services on an error body are optional.
            }
          }
          that._resolveWithError(xhr, dataUri, "network", resolve);
        };
        xhr.ontimeout = () =>
          that._resolveWithError(xhr, dataUri, "timeout", resolve);
        xhr.onabort = () =>
          that._resolveWithError(xhr, dataUri, "abort", resolve);

        xhr.send();
      }
    });
  }
}
