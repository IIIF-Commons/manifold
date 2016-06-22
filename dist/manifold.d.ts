// manifold v1.0.0 https://github.com/UniversalViewer/manifold#readme
declare module Manifold {
    class StringValue {
        value: string;
        constructor(value?: string);
        toString(): string;
    }
}

declare module Manifold {
    class TreeSortType extends StringValue {
        static DATE: TreeSortType;
        static NONE: TreeSortType;
        date(): TreeSortType;
        none(): TreeSortType;
    }
}

/// <reference path="StringValue.d.ts" />
/// <reference path="TreeSortType.d.ts" />

declare module Manifold {
    class Bootstrapper {
        private _options;
        constructor(options: Manifold.IManifoldOptions);
        bootstrap(): Promise<Manifold.Helper>;
    }
}

declare module Manifold {
    class Helper implements IHelper {
        iiifResource: Manifesto.IIIIFResource;
        iiifResourceUri: string;
        manifest: Manifesto.IManifest;
        collectionIndex: number;
        manifestIndex: number;
        canvasIndex: number;
        sequenceIndex: number;
        constructor(options: IManifoldOptions);
        getAutoCompleteService(): Manifesto.IService;
        getAttribution(): string;
        getCanvases(): Manifesto.ICanvas[];
        getCanvasById(id: string): Manifesto.ICanvas;
        getCanvasesById(ids: string[]): Manifesto.ICanvas[];
        getCanvasByIndex(index: number): Manifesto.ICanvas;
        getCanvasIndexById(id: string): number;
        getCanvasIndexByLabel(label: string): number;
        getCanvasMetadata(canvas: Manifesto.ICanvas): Manifold.IMetadataItem[];
        getCanvasRange(canvas: Manifesto.ICanvas, path?: string): Manifesto.IRange;
        getCanvasRanges(canvas: Manifesto.ICanvas): Manifesto.IRange[];
        getCollectionIndex(iiifResource: Manifesto.IIIIFResource): number;
        getCurrentCanvas(): Manifesto.ICanvas;
        getCurrentElement(): Manifesto.IElement;
        getCurrentSequence(): Manifesto.ISequence;
        getElementType(element?: Manifesto.IElement): Manifesto.ElementType;
        getFirstPageIndex(): number;
        getInfoUri(canvas: Manifesto.ICanvas): string;
        getLabel(): string;
        getLastCanvasLabel(alphanumeric?: boolean): string;
        getLastPageIndex(): number;
        getLicense(): string;
        getLogo(): string;
        getManifestType(): Manifesto.ManifestType;
        getMetadata(licenseFormatter?: Manifold.UriLabeller): Manifold.IMetadataItem[];
        getMultiSelectState(): Manifold.MultiSelectState;
        getRanges(): IRange[];
        getRangeByPath(path: string): any;
        getRangeCanvases(range: Manifesto.IRange): Manifesto.ICanvas[];
        getResources(): Manifesto.IAnnotation[];
        getSearchWithinService(): Manifesto.IService;
        getSeeAlso(): any;
        getSequenceByIndex(index: number): Manifesto.ISequence;
        getSortedTreeNodesByDate(sortedTree: ITreeNode, tree: ITreeNode): void;
        getStartCanvasIndex(): number;
        getThumbs(width: number, height: number): Manifesto.IThumb[];
        getTotalCanvases(): number;
        getTrackingLabel(): string;
        getTree(sortType?: TreeSortType): ITreeNode;
        private _treeHasNavDates(tree);
        getViewingDirection(): Manifesto.ViewingDirection;
        getViewingHint(): Manifesto.ViewingHint;
        hasParentCollection(): boolean;
        hasResources(): boolean;
        isBottomToTop(): boolean;
        isCanvasIndexOutOfRange(index: number): boolean;
        isContinuous(): boolean;
        isFirstCanvas(index?: number): boolean;
        isHorizontallyAligned(): boolean;
        isLastCanvas(index?: number): boolean;
        isLeftToRight(): boolean;
        isMultiCanvas(): boolean;
        isMultiSequence(): boolean;
        isPaged(): boolean;
        isPagingAvailable(): boolean;
        isPagingEnabled(): boolean;
        isRightToLeft(): boolean;
        isTopToBottom(): boolean;
        isTotalCanvasesEven(): boolean;
        isUIEnabled(name: string): boolean;
        isVerticallyAligned(): boolean;
        createDateNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void;
        createDecadeNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void;
        createMonthNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void;
        createYearNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void;
        getDecadeNode(rootNode: ITreeNode, year: number): ITreeNode;
        getMonthNode(yearNode: ITreeNode, month: Number): ITreeNode;
        getNodeDisplayDate(node: ITreeNode): string;
        getNodeDisplayMonth(node: ITreeNode): string;
        getNodeMonth(node: ITreeNode): number;
        getNodeYear(node: ITreeNode): number;
        getYearNode(decadeNode: ITreeNode, year: Number): ITreeNode;
        pruneDecadeNodes(rootNode: ITreeNode): void;
        sortDecadeNodes(rootNode: ITreeNode): void;
        sortMonthNodes(rootNode: ITreeNode): void;
        sortYearNodes(rootNode: ITreeNode): void;
    }
}

declare module Manifold {
    interface ICanvas extends IMultiSelectable, Manifesto.ICanvas {
    }
}

declare module Manifold {
    interface IHelper {
        iiifResource: Manifesto.IIIIFResource;
        iiifResourceUri: string;
        manifest: Manifesto.IManifest;
        collectionIndex: number;
        manifestIndex: number;
        canvasIndex: number;
        sequenceIndex: number;
        getAutoCompleteService(): Manifesto.IService;
        getAttribution(): string;
        getCanvases(): Manifesto.ICanvas[];
        getCanvasById(id: string): Manifesto.ICanvas;
        getCanvasesById(ids: string[]): Manifesto.ICanvas[];
        getCanvasByIndex(index: number): Manifesto.ICanvas;
        getCanvasIndexById(id: string): number;
        getCanvasIndexByLabel(label: string): number;
        getCanvasMetadata(canvas: Manifesto.ICanvas): Manifold.IMetadataItem[];
        getCanvasRange(canvas: Manifesto.ICanvas, path?: string): Manifesto.IRange;
        getCanvasRanges(canvas: Manifesto.ICanvas): Manifesto.IRange[];
        getCollectionIndex(iiifResource: Manifesto.IIIIFResource): number;
        getCurrentCanvas(): Manifesto.ICanvas;
        getCurrentElement(): Manifesto.IElement;
        getCurrentSequence(): Manifesto.ISequence;
        getElementType(element?: Manifesto.IElement): Manifesto.ElementType;
        getFirstPageIndex(): number;
        getInfoUri(canvas: Manifesto.ICanvas): string;
        getLabel(): string;
        getLastCanvasLabel(alphanumeric?: boolean): string;
        getLastPageIndex(): number;
        getLicense(): string;
        getLogo(): string;
        getManifestType(): Manifesto.ManifestType;
        getMetadata(): Manifold.IMetadataItem[];
        getMultiSelectState(): Manifold.MultiSelectState;
        getPagedIndices(canvasIndex?: number): number[];
        getRanges(): IRange[];
        getRangeByPath(path: string): any;
        getRangeCanvases(range: Manifesto.IRange): Manifesto.ICanvas[];
        getResources(): Manifesto.IAnnotation[];
        getSearchWithinService(): Manifesto.IService;
        getSeeAlso(): any;
        getSequenceByIndex(index: number): Manifesto.ISequence;
        getSortedTreeNodesByDate(sortedTree: ITreeNode, tree: ITreeNode): void;
        getStartCanvasIndex(): number;
        getThumbs(width: number, height: number): Manifesto.IThumb[];
        getTotalCanvases(): number;
        getTrackingLabel(): string;
        getTree(sortType?: TreeSortType): ITreeNode;
        getViewingDirection(): Manifesto.ViewingDirection;
        getViewingHint(): Manifesto.ViewingHint;
        hasParentCollection(): boolean;
        hasResources(): boolean;
        isBottomToTop(): boolean;
        isCanvasIndexOutOfRange(index: number): boolean;
        isContinuous(): boolean;
        isFirstCanvas(index?: number): boolean;
        isHorizontallyAligned(): boolean;
        isLastCanvas(index?: number): boolean;
        isLeftToRight(): boolean;
        isMultiCanvas(): boolean;
        isMultiSequence(): boolean;
        isPaged(): boolean;
        isPagingAvailable(): boolean;
        isPagingEnabled(): boolean;
        isRightToLeft(): boolean;
        isTopToBottom(): boolean;
        isTotalCanvasesEven(): boolean;
        isUIEnabled(name: string): boolean;
        isVerticallyAligned(): boolean;
    }
}

interface IManifold {
    loadManifest: (options: Manifold.IManifoldOptions) => Promise<Manifold.IHelper>;
    TreeSortType: Manifold.TreeSortType;
}

declare module Manifold {
    interface IManifoldOptions {
        iiifResourceUri: string;
        iiifResource: Manifesto.IIIIFResource;
        manifest: Manifesto.IManifest;
        collectionIndex: number;
        manifestIndex: number;
        sequenceIndex: number;
        canvasIndex: number;
    }
}

declare module Manifold {
    interface IMetadataItem {
        label: string;
        value: string | IMetadataItem[];
        isRootLevel: boolean;
    }
}

declare module Manifold {
    interface IMultiSelectable {
        multiSelected: boolean;
        multiSelectEnabled: boolean;
    }
}

declare module Manifold {
    interface IRange extends IMultiSelectable, Manifesto.IRange {
    }
}

declare module Manifold {
    interface IThumb extends IMultiSelectable, Manifesto.IThumb {
        initialWidth: number;
        initialHeight: number;
    }
}

declare module Manifold {
    interface ITreeNode extends IMultiSelectable, Manifesto.ITreeNode {
    }
}


declare module Manifold {
    class MultiSelectState {
        enabled: boolean;
        ranges: IRange[];
        canvases: ICanvas[];
        allCanvasesSelected(): boolean;
        allRangesSelected(): boolean;
        allSelected(): boolean;
        getAll(): IMultiSelectable[];
        getAllSelectedCanvases(): ICanvas[];
        getAllSelectedRanges(): IRange[];
        getCanvasById(id: string): ICanvas;
        getCanvasesByIds(ids: string[]): ICanvas[];
        getRangeCanvases(range: Manifesto.IRange): Manifesto.ICanvas[];
        selectAll(selected: boolean): void;
        selectCanvas(canvas: ICanvas, selected: boolean): void;
        selectAllCanvases(selected: boolean): void;
        selectCanvases(canvases: ICanvas[], selected: boolean): void;
        selectRange(range: IRange, selected: boolean): void;
        selectAllRanges(selected: boolean): void;
        selectRanges(ranges: IRange[], selected: boolean): void;
        setEnabled(enabled: boolean): void;
    }
}

declare module Manifold {
    class UriLabeller {
        labels: Object;
        constructor(labels: Object);
        format(url: any): string;
    }
}
