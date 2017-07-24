namespace Manifold {

    export class ExternalResource implements Manifesto.IExternalResource {

        public authAPIVersion: number;
        public clickThroughService: Manifesto.IService | null = null;
        public contentProviderInteractionEnabled: boolean = true;
        public data: any;
        public dataUri: string;
        public error: any;
        public externalService: Manifesto.IService | null = null;
        public height: number;
        public index: number;
        public isResponseHandled: boolean = false;
        public kioskService: Manifesto.IService;
        public loginService: Manifesto.IService | null = null;
        public logoutService: Manifesto.IService | null = null;
        public restrictedService: Manifesto.IService | null;
        public status: number;
        public tokenService: Manifesto.IService | null = null;
        public width: number;
        public x: number;
        public y: number;

        constructor(resource: Manifesto.IManifestResource, dataUriFunc: (r: Manifesto.IManifestResource) => string, index: number, authApiVersion: number = 0.9) {
            resource.externalResource = this;
            this.dataUri = dataUriFunc(resource);
            this.index = index;
            this.authAPIVersion = authApiVersion;
            this._parseAuthServices(resource);
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
            return this.dataUri.endsWith('info.json');
        }

        public getData(accessToken?: Manifesto.IAccessToken): Promise<Manifesto.IExternalResource> {
            const that = this;
            that.data = {};

            return new Promise<Manifesto.IExternalResource>((resolve, reject) => {

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
                        if (accessToken){
                            xhr.setRequestHeader("Authorization", "Bearer " + accessToken.accessToken);
                        }
                    }
                }).done((data) => {

                    // if it's a resource without an info.json
                    // todo: if resource doesn't have a @profile
                    if (!data) {
                        that.status = HTTPStatusCode.OK;
                        resolve(that);
                    } else {
                        let uri = unescape(data['@id']);

                        that.data = data;
                        that._parseAuthServices(that.data);

                        // remove trailing /info.json
                        if (uri.endsWith('/info.json')){
                            uri = uri.substr(0, uri.lastIndexOf('/'));
                        }

                        let dataUri = that.dataUri;

                        if (dataUri.endsWith('/info.json')){
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