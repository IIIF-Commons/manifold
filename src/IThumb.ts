namespace Manifold {

    export interface IThumb extends Manifesto.IThumb {
        initialWidth: number;
        initialHeight: number;
        multiSelectionEnabled: boolean;
        multiSelected: boolean;
    }
    
}