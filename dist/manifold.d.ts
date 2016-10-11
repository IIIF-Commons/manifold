// manifold v1.0.5 https://github.com/viewdir/manifold#readme
declare namespace Manifold {
    class StringValue {
        value: string;
        constructor(value?: string);
        toString(): string;
    }
}

declare namespace Manifold {
    class TreeSortType extends StringValue {
        static DATE: TreeSortType;
        static NONE: TreeSortType;
        date(): TreeSortType;
        none(): TreeSortType;
    }
}

/// <reference path="StringValue.d.ts" />
/// <reference path="TreeSortType.d.ts" />

declare namespace Manifold {
    class Bootstrapper {
        private _options;
        constructor(options: Manifold.IManifoldOptions);
        bootstrap(): Promise<Manifold.IHelper>;
        private _loaded(bootstrapper, json, resolve, reject);
        private _msieversion();
    }
}

declare namespace Manifold {
    class ExternalResource implements Manifesto.IExternalResource {
        clickThroughService: Manifesto.IService;
        data: any;
        dataUri: string;
        error: any;
        height: number;
        isResponseHandled: boolean;
        loginService: Manifesto.IService;
        logoutService: Manifesto.IService;
        restrictedService: Manifesto.IService;
        status: number;
        tokenService: Manifesto.IService;
        width: number;
        x: number;
        y: number;
        constructor(resource: Manifesto.IManifestResource, dataUriFunc: (r: Manifesto.IManifestResource) => string);
        private _parseAuthServices(resource);
        isAccessControlled(): boolean;
        hasServiceDescriptor(): boolean;
        getData(accessToken?: Manifesto.IAccessToken): Promise<Manifesto.IExternalResource>;
    }
}

declare namespace Manifold {
    class Helper implements IHelper {
        private _multiSelectState;
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
        getMetadata(options?: MetadataOptions): MetadataGroup[];
        private _parseMetadataOptions(options, metadataGroups);
        getMultiSelectState(): Manifold.MultiSelectState;
        getRanges(): IRange[];
        getRangeByPath(path: string): any;
        getRangeCanvases(range: Manifesto.IRange): Manifesto.ICanvas[];
        getRelated(): any;
        getResources(): Manifesto.IAnnotation[];
        getSearchWithinService(): Manifesto.IService;
        getSeeAlso(): any;
        getSequenceByIndex(index: number): Manifesto.ISequence;
        getShareServiceUrl(): string;
        getSortedTreeNodesByDate(sortedTree: ITreeNode, tree: ITreeNode): void;
        getStartCanvasIndex(): number;
        getThumbs(width: number, height: number): Manifesto.IThumb[];
        getTopRanges(): Manifesto.IRange[];
        getTotalCanvases(): number;
        getTrackingLabel(): string;
        getTree(topRangeIndex?: number, sortType?: TreeSortType): ITreeNode;
        treeHasNavDates(tree: ITreeNode): boolean;
        getViewingDirection(): Manifesto.ViewingDirection;
        getViewingHint(): Manifesto.ViewingHint;
        hasParentCollection(): boolean;
        hasRelatedPage(): boolean;
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

declare namespace Manifold {
    interface ICanvas extends IMultiSelectable, Manifesto.ICanvas {
    }
}

declare namespace Manifold {
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
        getMetadata(options?: MetadataOptions): Manifold.MetadataGroup[];
        getMultiSelectState(): Manifold.MultiSelectState;
        getRanges(): IRange[];
        getRangeByPath(path: string): any;
        getRangeCanvases(range: Manifesto.IRange): Manifesto.ICanvas[];
        getRelated(): any;
        getResources(): Manifesto.IAnnotation[];
        getSearchWithinService(): Manifesto.IService;
        getSeeAlso(): any;
        getSequenceByIndex(index: number): Manifesto.ISequence;
        getShareServiceUrl(): string;
        getSortedTreeNodesByDate(sortedTree: ITreeNode, tree: ITreeNode): void;
        getStartCanvasIndex(): number;
        getThumbs(width: number, height: number): Manifesto.IThumb[];
        getTopRanges(): Manifesto.IRange[];
        getTotalCanvases(): number;
        getTrackingLabel(): string;
        getTree(topRangeIndex?: number, sortType?: TreeSortType): ITreeNode;
        getViewingDirection(): Manifesto.ViewingDirection;
        getViewingHint(): Manifesto.ViewingHint;
        hasParentCollection(): boolean;
        hasRelatedPage(): boolean;
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
        treeHasNavDates(tree: ITreeNode): boolean;
    }
}

interface IManifold {
    loadManifest: (options: Manifold.IManifoldOptions) => Promise<Manifold.IHelper>;
}

declare namespace Manifold {
    interface IManifoldOptions {
        iiifResourceUri: string;
        iiifResource: Manifesto.IIIIFResource;
        locale: string;
        manifest: Manifesto.IManifest;
        collectionIndex: number;
        manifestIndex: number;
        sequenceIndex: number;
        canvasIndex: number;
    }
}

declare namespace Manifold {
    interface IMetadataItem {
        label: string;
        value: string;
        isTranslatable: boolean;
    }
}

declare namespace Manifold {
    interface IMultiSelectable {
        multiSelected: boolean;
        multiSelectEnabled: boolean;
    }
}

declare namespace Manifold {
    interface IRange extends IMultiSelectable, Manifesto.IRange {
    }
}

declare namespace Manifold {
    interface IThumb extends IMultiSelectable, Manifesto.IThumb {
        initialWidth: number;
        initialHeight: number;
    }
}

declare namespace Manifold {
    interface ITreeNode extends IMultiSelectable, Manifesto.ITreeNode {
    }
}

declare namespace Manifold {
    function loadManifest(options: any): Promise<IHelper>;
}

declare namespace Manifold {
    class MetadataGroup {
        type: MetadataGroupType;
        name: string;
        items: IMetadataItem[];
        constructor(type: MetadataGroupType, name?: string);
        addItem(item: IMetadataItem): void;
        addMetadata(metadata: any[], isTranslatable?: boolean): void;
    }
}

declare namespace Manifold {
    class MetadataGroupType extends StringValue {
        static MANIFEST: MetadataGroupType;
        static SEQUENCE: MetadataGroupType;
        static RANGE: MetadataGroupType;
        static CANVAS: MetadataGroupType;
        static IMAGE: MetadataGroupType;
    }
}

declare namespace Manifold {
    class MetadataItem implements IMetadataItem {
        label: string;
        value: string;
        isTranslatable: boolean;
        constructor(label: string, value: string, isTranslatable?: boolean);
    }
}

declare namespace Manifold {
    class MetadataOptions {
        canvases: Manifesto.ICanvas[];
        licenseFormatter: Manifold.UriLabeller;
        range: Manifesto.IRange;
    }
}

declare namespace Manifold {
    class MultiSelectState {
        isEnabled: boolean;
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

declare namespace Manifold {
    class UriLabeller {
        labels: Object;
        constructor(labels: Object);
        format(url: any): string;
    }
}
