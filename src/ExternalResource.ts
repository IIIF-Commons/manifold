namespace Manifold {

    export class ExternalResource implements Manifesto.IExternalResource {

        public authAPIVersion: number;
        public authHoldingPage: any = null;
        public clickThroughService: Manifesto.IService | null = null;
        public data: any;
        public dataUri: string | null;
        public error: any;
        public externalService: Manifesto.IService | null = null;
        public height: number;
        public index: number;
        public isResponseHandled: boolean = false;
        public kioskService: Manifesto.IService | null = null;
        public loginService: Manifesto.IService | null = null;
        public logoutService: Manifesto.IService | null = null;
        public restrictedService: Manifesto.IService | null = null;
        public status: number;
        public tokenService: Manifesto.IService | null = null;
        public width: number;

        constructor(canvas: Manifesto.ICanvas, options: Manifesto.IExternalResourceOptions) {
            
            // todo:
            // get the height and width of the resource if available
            // and set on externalresource
            
            canvas.externalResource = <Manifesto.IExternalResource>this;
            this.dataUri = this._getDataUri(canvas);
            this.index = canvas.index;
            this.authAPIVersion = options.authApiVersion;
            this._parseAuthServices(canvas);
        }

        private _getDataUri(canvas: Manifesto.ICanvas): string | null {
            
            const content: Manifesto.IAnnotation[] = canvas.getContent();
            const images: Manifesto.IAnnotation[] = canvas.getImages();

            if (content && content.length) {

                const annotation: Manifesto.IAnnotation = content[0];
                const annotationBody: Manifesto.IAnnotationBody[] = annotation.getBody();

                if (annotationBody.length) {
                    return annotationBody[0].id;
                }

                return null;

            } else if (images && images.length) {

                let infoUri: string | null = null;

                const firstImage: Manifesto.IAnnotation = images[0];
                const resource: Manifesto.IResource = firstImage.getResource();
                const services: Manifesto.IService[] = resource.getServices();

                if (services.length) {
                    for (let i = 0; i < services.length; i++) {
                        const service: Manifesto.IService = services[i];
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

                // no image services. return the image id
                return resource.id;

            } else {

                // Legacy IxIF
                const service: Manifesto.IService | null = canvas.getService(manifesto.ServiceProfile.ixif());

                if (service) { // todo: deprecate
                    return service.getInfoUri();
                }

                // return the canvas id.
                return canvas.id;
            }
        }

        private _parseAuthServices(resource: any): void {

            if (this.authAPIVersion === 0.9) {

                this.clickThroughService = manifesto.Utils.getService(resource, manifesto.ServiceProfile.clickThrough().toString());
                this.loginService = manifesto.Utils.getService(resource, manifesto.ServiceProfile.login().toString());
                this.restrictedService = manifesto.Utils.getService(resource, manifesto.ServiceProfile.restricted().toString());

                if (this.clickThroughService) {
                    this.logoutService = this.clickThroughService.getService(manifesto.ServiceProfile.logout().toString());
                    this.tokenService = this.clickThroughService.getService(manifesto.ServiceProfile.token().toString());
                } else if (this.loginService) {
                    this.logoutService = this.loginService.getService(manifesto.ServiceProfile.logout().toString());
                    this.tokenService = this.loginService.getService(manifesto.ServiceProfile.token().toString());
                } else if (this.restrictedService) {
                    this.logoutService = this.restrictedService.getService(manifesto.ServiceProfile.logout().toString());
                    this.tokenService = this.restrictedService.getService(manifesto.ServiceProfile.token().toString());
                }

            } else { // auth 1

                this.clickThroughService = manifesto.Utils.getService(resource, manifesto.ServiceProfile.auth1Clickthrough().toString());
                this.loginService = manifesto.Utils.getService(resource, manifesto.ServiceProfile.auth1Login().toString());
                this.externalService = manifesto.Utils.getService(resource, manifesto.ServiceProfile.auth1External().toString());
                this.kioskService = manifesto.Utils.getService(resource, manifesto.ServiceProfile.auth1Kiosk().toString());

                if (this.clickThroughService) {
                    this.logoutService = this.clickThroughService.getService(manifesto.ServiceProfile.auth1Logout().toString());
                    this.tokenService = this.clickThroughService.getService(manifesto.ServiceProfile.auth1Token().toString());
                } else if (this.loginService) {
                    this.logoutService = this.loginService.getService(manifesto.ServiceProfile.auth1Logout().toString());
                    this.tokenService = this.loginService.getService(manifesto.ServiceProfile.auth1Token().toString());
                } else if (this.externalService) {
                    this.logoutService = this.externalService.getService(manifesto.ServiceProfile.auth1Logout().toString());
                    this.tokenService = this.externalService.getService(manifesto.ServiceProfile.auth1Token().toString());
                } else if (this.kioskService) {
                    this.logoutService = this.kioskService.getService(manifesto.ServiceProfile.auth1Logout().toString());
                    this.tokenService = this.kioskService.getService(manifesto.ServiceProfile.auth1Token().toString());
                }
            }
        }

        public isAccessControlled(): boolean {
            if (this.clickThroughService || this.loginService || this.externalService || this.kioskService) {
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

        public getData(accessToken?: Manifesto.IAccessToken): Promise<Manifesto.IExternalResource> {
            const that = this;
            that.data = {};

            return new Promise<Manifesto.IExternalResource>((resolve, reject) => {

                if (!this.dataUri) {
                    reject('There is no dataUri to fetch');
                }

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

                $.ajax(<JQueryAjaxSettings>{
                    url: that.dataUri,
                    type: type,
                    dataType: 'json',
                    beforeSend: (xhr) => {
                        if (accessToken) {
                            xhr.setRequestHeader("Authorization", "Bearer " + accessToken.accessToken);
                        }
                    }
                }).done((data: any) => {

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

                        if (dataUri && dataUri.endsWith('/info.json')){
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

                }).fail((error) => {

                    that.status = error.status;
                    that.error = error;
                    if (error.responseJSON){
                        that._parseAuthServices(error.responseJSON);
                    }
                    resolve(that);

                });
            });
        }
    }
}