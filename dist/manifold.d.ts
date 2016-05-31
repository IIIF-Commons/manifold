// manifold v1.0.0 https://github.com/UniversalViewer/manifold#readme
declare namespace Manifold {
    interface ICanvas extends Manifesto.ICanvas {
        multiSelected: boolean;
    }
}

declare namespace Manifold {
    interface IRange extends Manifesto.IRange {
        multiSelected: boolean;
    }
}

declare namespace Manifold {
    interface IThumb extends Manifesto.IThumb {
        initialWidth: number;
        initialHeight: number;
        multiSelectionEnabled: boolean;
        multiSelected: boolean;
    }
}

declare namespace Manifold {
    interface ITreeNode extends Manifesto.ITreeNode {
        multiSelectionEnabled: boolean;
        multiSelected: boolean;
    }
}

declare namespace Manifold {
    class MultiSelectState {
        enabled: boolean;
        ranges: IRange[];
        canvases: ICanvas[];
    }
}
