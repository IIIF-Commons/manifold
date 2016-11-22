namespace Manifold {

    export interface IThumb extends IMultiSelectable, Manifesto.IThumb {
        initialWidth: number;
        initialHeight: number;
        data: any; // used to store arbitrary data
    }
    
}