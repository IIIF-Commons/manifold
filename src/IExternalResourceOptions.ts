namespace Manifesto {
    export interface IExternalResourceOptions {
        authAPIVersion: number;
        dataUri: string;
        dataUriFunc: (r: Manifesto.IManifestResource) => string;
    }
}