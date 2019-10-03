import { ServiceProfile } from "@iiif/vocabulary";
import * as HTTPStatusCode from "@edsilv/http-status-codes";

export class ExternalResource implements manifesto.IExternalResource {

    public authAPIVersion: number;
    public authHoldingPage: any = null;
    public clickThroughService: manifesto.Service | null = null;
    public data: any;
    public dataUri: string | null;
    public error: any;
    public externalService: manifesto.Service | null = null;
    public height: number;
    public index: number;
    public isProbed: boolean = false;
    public isResponseHandled: boolean = false;
    public kioskService: manifesto.Service | null = null;
    public loginService: manifesto.Service | null = null;
    public logoutService: manifesto.Service | null = null;
    public probeService: manifesto.Service | null = null;
    public restrictedService: manifesto.Service | null = null;
    public status: number;
    public tokenService: manifesto.Service | null = null;
    public width: number;

    constructor(canvas: manifesto.Canvas, options: manifesto.IExternalResourceOptions) {
        canvas.externalResource = <ExternalResource>this;
        this.dataUri = this._getDataUri(canvas);
        this.index = canvas.index;
        this.authAPIVersion = options.authApiVersion;
        this._parseAuthServices(canvas);
        // get the height and width of the image resource if available
        this._parseDimensions(canvas);
    }

    private _getImageServiceDescriptor(services: manifesto.Service[]): string | null {
        let infoUri: string | null = null;
        
        for (let i = 0; i < services.length; i++) {
            const service: manifesto.Service = services[i];
            let id: string = service.id;

            if (!id.endsWith('/')) {
                id += '/';
            }

            if (manifesto.Utils.isImageProfile(service.getProfile())) {
                infoUri = id + 'info.json';
            }
        }

        return infoUri;
    }

    private _getDataUri(canvas: manifesto.Canvas): string | null {
        
        const content: manifesto.Annotation[] = canvas.getContent();
        const images: manifesto.Annotation[] = canvas.getImages();
        let infoUri: string | null = null;

        // presentation 3
        if (content && content.length) {

            const annotation: manifesto.Annotation = content[0];
            const annotationBody: manifesto.AnnotationBody[] = annotation.getBody();

            if (annotationBody.length) {
                const body: manifesto.AnnotationBody = annotationBody[0];
                const services: manifesto.Service[] = body.getServices();

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

        } else if (images && images.length) { // presentation 2

            const firstImage: manifesto.Annotation = images[0];
            const resource: manifesto.Resource = firstImage.getResource();
            const services: manifesto.Service[] = resource.getServices();

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
            const service: manifesto.Service | null = canvas.getService(ServiceProfile.IXIF);

            if (service) { // todo: deprecate
                return service.getInfoUri();
            }

            // return the canvas id.
            return canvas.id;
        }
    }

    private _parseAuthServices(resource: any): void {

        if (this.authAPIVersion === 0.9) {

            this.clickThroughService = manifesto.Utils.getService(resource, ServiceProfile.AUTH_0_CLICK_THROUGH);
            this.loginService = manifesto.Utils.getService(resource, ServiceProfile.AUTH_0_LOGIN);
            this.restrictedService = manifesto.Utils.getService(resource, ServiceProfile.AUTH_0_RESTRICTED);

            if (this.clickThroughService) {
                this.logoutService = this.clickThroughService.getService(ServiceProfile.AUTH_0_LOGOUT);
                this.tokenService = this.clickThroughService.getService(ServiceProfile.AUTH_0_TOKEN);
            } else if (this.loginService) {
                this.logoutService = this.loginService.getService(ServiceProfile.AUTH_0_LOGOUT);
                this.tokenService = this.loginService.getService(ServiceProfile.AUTH_0_TOKEN);
            } else if (this.restrictedService) {
                this.logoutService = this.restrictedService.getService(ServiceProfile.AUTH_0_LOGOUT);
                this.tokenService = this.restrictedService.getService(ServiceProfile.AUTH_0_TOKEN);
            }

        } else { // auth 1

            // if the resource is a canvas, not an info.json, look for auth services on its content.
            if (resource.isCanvas !== undefined && resource.isCanvas()) {
                const content: manifesto.Annotation[] = (<manifesto.Canvas>resource).getContent();

                if (content && content.length) {
                    const body: manifesto.AnnotationBody[] = content[0].getBody();

                    if (body && body.length) {
                        const annotation: manifesto.AnnotationBody = body[0];
                        resource = annotation;
                    }
                }
            }

            this.clickThroughService = manifesto.Utils.getService(resource, ServiceProfile.AUTH_1_CLICK_THROUGH);
            this.loginService = manifesto.Utils.getService(resource, ServiceProfile.AUTH_1_LOGIN);
            this.externalService = manifesto.Utils.getService(resource, ServiceProfile.AUTH_1_EXTERNAL);
            this.kioskService = manifesto.Utils.getService(resource, ServiceProfile.AUTH_1_KIOSK);

            if (this.clickThroughService) {
                this.logoutService = this.clickThroughService.getService(ServiceProfile.AUTH_1_LOGOUT);
                this.tokenService = this.clickThroughService.getService(ServiceProfile.AUTH_1_TOKEN);
                this.probeService = this.clickThroughService.getService(ServiceProfile.AUTH_1_PROBE);
            } else if (this.loginService) {
                this.logoutService = this.loginService.getService(ServiceProfile.AUTH_1_LOGOUT);
                this.tokenService = this.loginService.getService(ServiceProfile.AUTH_1_TOKEN);
                this.probeService = this.loginService.getService(ServiceProfile.AUTH_1_PROBE);
            } else if (this.externalService) {
                this.logoutService = this.externalService.getService(ServiceProfile.AUTH_1_LOGOUT);
                this.tokenService = this.externalService.getService(ServiceProfile.AUTH_1_TOKEN);
                this.probeService = this.externalService.getService(ServiceProfile.AUTH_1_PROBE);
            } else if (this.kioskService) {
                this.logoutService = this.kioskService.getService(ServiceProfile.AUTH_1_LOGOUT);
                this.tokenService = this.kioskService.getService(ServiceProfile.AUTH_1_TOKEN);
                this.probeService = this.kioskService.getService(ServiceProfile.AUTH_1_PROBE);
            }
        }
    }
    
    private _parseDimensions(canvas: manifesto.Canvas): void {
        let images: manifesto.Annotation[] = canvas.getImages();
        
        if (images && images.length) {
            const firstImage = images[0];
            const resource: manifesto.Resource = firstImage.getResource();

            this.width = resource.getWidth();
            this.height = resource.getHeight();
        } else {
            // presentation 3
            images = canvas.getContent();
            
            if (images.length) {
                const annotation: manifesto.Annotation = images[0];
                const body: manifesto.AnnotationBody[] = annotation.getBody();

                if (body.length) {
                    this.width = body[0].getWidth();
                    this.height = body[0].getHeight();
                }
            }
        }
    }

    public isAccessControlled(): boolean {
        if (this.clickThroughService || this.loginService || this.externalService || this.kioskService || this.probeService) {
            return true;
        }
        return false;
    }

    public hasServiceDescriptor(): boolean {
        if (this.dataUri) {
            return this.dataUri.endsWith('info.json');
        }
        
        return false;
    }

    public getData(accessToken?: manifesto.IAccessToken): Promise<ExternalResource> {
        const that = this;
        that.data = {};

        return new Promise<ExternalResource>((resolve, reject) => {

            if (!that.dataUri) {
                reject('There is no dataUri to fetch');
                return;
            }

            // if the resource has a probe service, use that to get http status code
            if (that.probeService) {

                that.isProbed = true;

                // $.ajax(<JQueryAjaxSettings>{
                //     url: that.probeService.id,
                //     type: 'GET',
                //     dataType: 'json',
                //     beforeSend: (xhr) => {
                //         if (accessToken) {
                //             xhr.setRequestHeader("Authorization", "Bearer " + accessToken.accessToken);
                //         }
                //     }
                // }).done((data: any) => {

                //     let contentLocation: string = unescape(data.contentLocation);

                //     if (contentLocation !== that.dataUri) {
                //         that.status = HTTPStatusCode.MOVED_TEMPORARILY;
                //     } else {
                //         that.status = HTTPStatusCode.OK;
                //     }

                //     resolve(that);

                // }).fail((error) => {

                //     that.status = error.status;
                //     that.error = error;
                //     resolve(that);

                // });

                // xhr implementation
                const xhr: XMLHttpRequest = new XMLHttpRequest();
                xhr.open('GET', that.probeService.id, true);
                xhr.withCredentials = true;

                xhr.onload = () => {
                    const data = JSON.parse(xhr.responseText);
                    let contentLocation: string = unescape(data.contentLocation);

                    if (contentLocation !== that.dataUri) {
                        that.status = HTTPStatusCode.MOVED_TEMPORARILY;
                    } else {
                        that.status = HTTPStatusCode.OK;
                    }

                    resolve(that);
                }

                xhr.onerror = () => {
                    that.status = xhr.status;
                    resolve(that);
                };

                xhr.send();

            } else {

                // check if dataUri ends with info.json
                // if not issue a HEAD request.

                let type: string = 'GET';

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
                    type = 'HEAD';
                }

                // $.ajax(<JQueryAjaxSettings>{
                //     url: that.dataUri,
                //     type: type,
                //     dataType: 'json',
                //     beforeSend: (xhr) => {
                //         if (accessToken) {
                //             xhr.setRequestHeader("Authorization", "Bearer " + accessToken.accessToken);
                //         }
                //     }
                // }).done((data: any) => {

                //     // if it's a resource without an info.json
                //     // todo: if resource doesn't have a @profile
                //     if (!data) {
                //         that.status = HTTPStatusCode.OK;
                //         resolve(that);
                //     } else {
                //         let uri: string = unescape(data['@id']);

                //         that.data = data;
                //         that._parseAuthServices(that.data);

                //         // remove trailing /info.json
                //         if (uri.endsWith('/info.json')){
                //             uri = uri.substr(0, uri.lastIndexOf('/'));
                //         }

                //         let dataUri: string | null = that.dataUri;

                //         if (dataUri && dataUri.endsWith('/info.json')){
                //             dataUri = dataUri.substr(0, dataUri.lastIndexOf('/'));
                //         }

                //         // if the request was redirected to a degraded version and there's a login service to get the full quality version
                //         if (uri !== dataUri && that.loginService) {
                //             that.status = HTTPStatusCode.MOVED_TEMPORARILY;
                //         } else {
                //             that.status = HTTPStatusCode.OK;
                //         }

                //         resolve(that);
                //     }

                // }).fail((error) => {

                //     that.status = error.status;
                //     that.error = error;
                //     if (error.responseJSON){
                //         that._parseAuthServices(error.responseJSON);
                //     }
                //     resolve(that);

                // });

                // xhr implementation
                const xhr: XMLHttpRequest = new XMLHttpRequest();
                xhr.open(type, that.dataUri, true);
                xhr.withCredentials = true;
                if (accessToken) {
                    xhr.setRequestHeader("Authorization", "Bearer " + accessToken.accessToken);
                }

                xhr.onload = () => {
                    const data = JSON.parse(xhr.responseText);
                    
                    // if it's a resource without an info.json
                    // todo: if resource doesn't have a @profile
                    if (!data) {
                        that.status = HTTPStatusCode.OK;
                        resolve(that);
                    } else {
                        let uri: string = unescape(data['@id']);

                        that.data = data;
                        that._parseAuthServices(that.data);

                        // remove trailing /info.json
                        if (uri.endsWith('/info.json')){
                            uri = uri.substr(0, uri.lastIndexOf('/'));
                        }

                        let dataUri: string | null = that.dataUri;

                        if (dataUri && dataUri.endsWith('/info.json')) {
                            dataUri = dataUri.substr(0, dataUri.lastIndexOf('/'));
                        }

                        // if the request was redirected to a degraded version and there's a login service to get the full quality version
                        if (uri !== dataUri && that.loginService){
                            that.status = HTTPStatusCode.MOVED_TEMPORARILY;
                        } else {
                            that.status = HTTPStatusCode.OK;
                        }

                        resolve(that);
                    }
                }

                xhr.onerror = () => {
                    that.status = xhr.status;
                    if (xhr.responseText) {
                        that._parseAuthServices(JSON.parse(xhr.responseText));
                    }
                    resolve(that);
                };

                xhr.send();

            }

        });
    }
}
