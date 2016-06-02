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
    class IIIFHelper {
        iiifResource: Manifesto.IIIIFResource;
        constructor(iiifResource: Manifesto.IIIIFResource);
        getTree(): Manifesto.ITreeNode;
        getSortedTree(sortType: TreeSortType): ITreeNode;
        getSortedTreeNodesByDate(sortedTree: ITreeNode, tree: ITreeNode): void;
        createDecadeNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void;
        pruneDecadeNodes(rootNode: ITreeNode): void;
        sortDecadeNodes(rootNode: ITreeNode): void;
        getDecadeNode(rootNode: ITreeNode, year: number): ITreeNode;
        createYearNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void;
        sortYearNodes(rootNode: ITreeNode): void;
        getYearNode(decadeNode: ITreeNode, year: Number): ITreeNode;
        createMonthNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void;
        sortMonthNodes(rootNode: ITreeNode): void;
        getMonthNode(yearNode: ITreeNode, month: Number): ITreeNode;
        createDateNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void;
        getNodeYear(node: ITreeNode): number;
        getNodeMonth(node: ITreeNode): number;
        getNodeDisplayMonth(node: ITreeNode): string;
        getNodeDisplayDate(node: ITreeNode): string;
    }
}

declare namespace Manifold {
    class MultiSelectState {
        enabled: boolean;
        ranges: IRange[];
        canvases: ICanvas[];
    }
}

declare namespace Manifold {
    enum TreeSortType {
        date = 0,
        none = 1,
    }
}
