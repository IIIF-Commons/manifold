// manifold v1.0.0 https://github.com/UniversalViewer/manifold#readme
declare namespace Manifold {
    interface ICanvas extends Manifesto.ICanvas {
        multiSelected: boolean;
    }
}

declare namespace Manifold {
    interface IManifestHelperOptions {
        manifest: Manifesto.IManifest;
        licenseMap: Object;
        sequenceIndex: number;
        canvasIndex: number;
    }
}

declare namespace Manifold {
    interface IMetadataItem {
        label: string;
        value: string | IMetadataItem[];
        isRootLevel: boolean;
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
    class ManifestHelper {
        manifest: Manifesto.IManifest;
        canvasIndex: number;
        sequenceIndex: number;
        private _licenseFormatter;
        constructor(options: IManifestHelperOptions);
        getAttribution(): string;
        getCanvases(): Manifesto.ICanvas[];
        getCanvasById(id: string): Manifesto.ICanvas;
        getCanvasesById(ids: string[]): Manifesto.ICanvas[];
        getCanvasByIndex(index: number): Manifesto.ICanvas;
        getCanvasRange(canvas: Manifesto.ICanvas): Manifesto.IRange;
        getCanvasRanges(canvas: Manifesto.ICanvas): Manifesto.IRange[];
        getCurrentCanvas(): Manifesto.ICanvas;
        getCurrentSequence(): Manifesto.ISequence;
        getCollectionIndex(iiifResource: Manifesto.IIIIFResource): number;
        getElementType(element?: Manifesto.IElement): Manifesto.ElementType;
        getLabel(): string;
        getLastCanvasLabel(alphanumeric?: boolean): string;
        getLicense(): string;
        getLogo(): string;
        getManifestType(): Manifesto.ManifestType;
        getSeeAlso(): any;
        getSequenceByIndex(index: number): Manifesto.ISequence;
        isCanvasIndexOutOfRange(index: number): boolean;
        isFirstCanvas(index?: number): boolean;
        isLastCanvas(index?: number): boolean;
        isMultiSequence(): boolean;
        isTotalCanvasesEven(): boolean;
        getRangeCanvases(range: Manifesto.IRange): Manifesto.ICanvas[];
        getTotalCanvases(): number;
        isMultiCanvas(): boolean;
        isUIEnabled(name: string): boolean;
        getInfoUri(canvas: Manifesto.ICanvas): string;
        getPagedIndices(canvasIndex?: number): number[];
        getViewingDirection(): Manifesto.ViewingDirection;
        getViewingHint(): Manifesto.ViewingHint;
        getFirstPageIndex(): number;
        getLastPageIndex(): number;
        getStartCanvasIndex(): number;
        getThumbs(width: number, height: number): Manifesto.IThumb[];
        getRangeByPath(path: string): any;
        getCanvasIndexById(id: string): number;
        getCanvasIndexByLabel(label: string): number;
        getRanges(): IRange[];
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
        getMetadata(): Manifold.IMetadataItem[];
        getCanvasMetadata(canvas: Manifesto.ICanvas): Manifold.IMetadataItem[];
        getCurrentElement(): Manifesto.IElement;
        getResources(): Manifesto.IAnnotation[];
        hasParentCollection(): boolean;
        hasResources(): boolean;
        isContinuous(): boolean;
        isPaged(): boolean;
        isBottomToTop(): boolean;
        isTopToBottom(): boolean;
        isLeftToRight(): boolean;
        isRightToLeft(): boolean;
        isHorizontallyAligned(): boolean;
        isVerticallyAligned(): boolean;
        isPagingAvailable(): boolean;
        isPagingEnabled(): boolean;
        getAutoCompleteService(): Manifesto.IService;
        getSearchWithinService(): Manifesto.IService;
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

declare namespace Manifold {
    class UriLabeller {
        labels: Object;
        constructor(labels: Object);
        format(url: any): string;
    }
}
