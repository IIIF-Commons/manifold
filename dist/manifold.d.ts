// manifold v1.2.3 https://github.com/viewdir/manifold#readme
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
interface Window {
    manifestCallback: any;
}
interface JQueryXHR {
    setRequestHeader: (name: string, value: string) => void;
}
declare function escape(s: string): string;
declare function unescape(s: string): string;

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

declare namespace Manifold {
    class AnnotationGroup {
        canvasIndex: number;
        rects: AnnotationRect[];
        constructor(resource: any, canvasIndex: number);
        addRect(resource: any): void;
    }
}

declare namespace Manifold {
    class AnnotationRect {
        canvasIndex: number;
        chars: string;
        height: number;
        index: number;
        isVisible: boolean;
        viewportX: number;
        viewportY: number;
        width: number;
        x: number;
        y: number;
        constructor(result: any);
    }
}

declare namespace Manifold {
    class Bootstrapper {
        private _options;
        constructor(options: Manifold.IManifoldOptions);
        bootstrap(): Promise<Manifold.IHelper>;
        private _loaded(bootstrapper, json, resolve, reject);
        private _detectIE();
    }
}

declare namespace Manifold {
    class ExternalResource implements Manifesto.IExternalResource {
        authAPIVersion: number;
        authHoldingPage: any;
        clickThroughService: Manifesto.IService | null;
        data: any;
        dataUri: string;
        error: any;
        externalService: Manifesto.IService | null;
        height: number;
        index: number;
        isResponseHandled: boolean;
        kioskService: Manifesto.IService;
        loginService: Manifesto.IService | null;
        logoutService: Manifesto.IService | null;
        restrictedService: Manifesto.IService | null;
        status: number;
        tokenService: Manifesto.IService | null;
        width: number;
        x: number;
        y: number;
        constructor(resource: Manifesto.IManifestResource, dataUriFunc: (r: Manifesto.IManifestResource) => string, index: number, authApiVersion?: number);
        private _parseAuthServices(resource);
        isAccessControlled(): boolean;
        hasServiceDescriptor(): boolean;
        getData(accessToken?: Manifesto.IAccessToken): Promise<Manifesto.IExternalResource>;
    }
}

declare type NullableTreeNode = Manifold.ITreeNode | null;
declare namespace Manifold {
    class Helper implements IHelper {
        private _multiSelectState;
        canvasIndex: number;
        collectionIndex: number;
        iiifResource: Manifesto.IIIIFResource;
        iiifResourceUri: string;
        manifest: Manifesto.IManifest;
        manifestIndex: number;
        options: IManifoldOptions;
        sequenceIndex: number;
        constructor(options: IManifoldOptions);
        getAutoCompleteService(): Manifesto.IService | null;
        getAttribution(): string | null;
        getCanvases(): Manifesto.ICanvas[];
        getCanvasById(id: string): Manifesto.ICanvas | null;
        getCanvasesById(ids: string[]): Manifesto.ICanvas[];
        getCanvasByIndex(index: number): Manifesto.ICanvas;
        getCanvasIndexById(id: string): number | null;
        getCanvasIndexByLabel(label: string): number;
        getCanvasRange(canvas: Manifesto.ICanvas, path?: string): Manifesto.IRange | null;
        getCanvasRanges(canvas: Manifesto.ICanvas): Manifesto.IRange[];
        getCollectionIndex(iiifResource: Manifesto.IIIIFResource): number | null;
        getCurrentCanvas(): Manifesto.ICanvas;
        getCurrentElement(): Manifesto.IElement;
        getCurrentSequence(): Manifesto.ISequence;
        getDescription(): string | null;
        getElementType(element?: Manifesto.IElement): Manifesto.ElementType;
        getFirstPageIndex(): number;
        getInfoUri(canvas: Manifesto.ICanvas): string | null;
        getLabel(): string | null;
        getLastCanvasLabel(alphanumeric?: boolean): string;
        getLastPageIndex(): number;
        getLicense(): string | null;
        getLogo(): string | null;
        getManifestType(): Manifesto.ManifestType;
        getMetadata(options?: MetadataOptions): MetadataGroup[];
        private _parseMetadataOptions(options, metadataGroups);
        private _getRangeMetadata(metadataGroups, range);
        getMultiSelectState(): Manifold.MultiSelectState;
        getRanges(): IRange[];
        getRangeByPath(path: string): any;
        getRangeCanvases(range: Manifesto.IRange): Manifesto.ICanvas[];
        getRelated(): any;
        getResources(): Manifesto.IAnnotation[];
        getSearchService(): Manifesto.IService | null;
        getSeeAlso(): any;
        getSequenceByIndex(index: number): Manifesto.ISequence;
        getShareServiceUrl(): string | null;
        getSortedTreeNodesByDate(sortedTree: ITreeNode, tree: ITreeNode): void;
        getStartCanvasIndex(): number;
        getThumbs(width: number, height: number): Manifesto.IThumb[];
        getTopRanges(): Manifesto.IRange[];
        getTotalCanvases(): number;
        getTrackingLabel(): string;
        getTree(topRangeIndex?: number, sortType?: TreeSortType): NullableTreeNode;
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
        getDecadeNode(rootNode: ITreeNode, year: number): ITreeNode | null;
        getMonthNode(yearNode: ITreeNode, month: Number): ITreeNode | null;
        getNodeDisplayDate(node: ITreeNode): string;
        getNodeDisplayMonth(node: ITreeNode): string;
        getNodeMonth(node: ITreeNode): number;
        getNodeYear(node: ITreeNode): number;
        getYearNode(decadeNode: ITreeNode, year: Number): ITreeNode | null;
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
        canvasIndex: number;
        collectionIndex: number;
        iiifResource: Manifesto.IIIIFResource;
        iiifResourceUri: string;
        manifest: Manifesto.IManifest;
        manifestIndex: number;
        options: IManifoldOptions;
        sequenceIndex: number;
        getAutoCompleteService(): Manifesto.IService | null;
        getAttribution(): string | null;
        getCanvases(): Manifesto.ICanvas[];
        getCanvasById(id: string): Manifesto.ICanvas | null;
        getCanvasesById(ids: string[]): Manifesto.ICanvas[];
        getCanvasByIndex(index: number): Manifesto.ICanvas;
        getCanvasIndexById(id: string): number | null;
        getCanvasIndexByLabel(label: string): number;
        getCanvasRange(canvas: Manifesto.ICanvas, path?: string): Manifesto.IRange | null;
        getCanvasRanges(canvas: Manifesto.ICanvas): Manifesto.IRange[];
        getCollectionIndex(iiifResource: Manifesto.IIIIFResource): number | null;
        getCurrentCanvas(): Manifesto.ICanvas;
        getCurrentElement(): Manifesto.IElement;
        getCurrentSequence(): Manifesto.ISequence;
        getDescription(): string | null;
        getElementType(element?: Manifesto.IElement): Manifesto.ElementType;
        getFirstPageIndex(): number;
        getInfoUri(canvas: Manifesto.ICanvas): string | null;
        getLabel(): string | null;
        getLastCanvasLabel(alphanumeric?: boolean): string;
        getLastPageIndex(): number;
        getLicense(): string | null;
        getLogo(): string | null;
        getManifestType(): Manifesto.ManifestType;
        getMetadata(options?: MetadataOptions): Manifold.MetadataGroup[];
        getMultiSelectState(): Manifold.MultiSelectState;
        getRanges(): IRange[];
        getRangeByPath(path: string): any;
        getRangeCanvases(range: Manifesto.IRange): Manifesto.ICanvas[];
        getRelated(): any;
        getResources(): Manifesto.IAnnotation[];
        getSearchService(): Manifesto.IService | null;
        getSeeAlso(): any;
        getSequenceByIndex(index: number): Manifesto.ISequence;
        getShareServiceUrl(): string | null;
        getSortedTreeNodesByDate(sortedTree: ITreeNode, tree: ITreeNode): void;
        getStartCanvasIndex(): number;
        getThumbs(width: number, height: number): Manifesto.IThumb[];
        getTopRanges(): Manifesto.IRange[];
        getTotalCanvases(): number;
        getTrackingLabel(): string;
        getTree(topRangeIndex?: number, sortType?: TreeSortType): NullableTreeNode;
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
    interface IMetadataItem extends Manifesto.MetadataItem {
        isRootLevel: boolean;
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
    function loadManifest(options: Manifold.IManifoldOptions): Promise<IHelper>;
}

declare namespace Manifold {
    class MetadataGroup {
        resource: Manifesto.IManifestResource;
        label: string | undefined;
        items: Manifold.IMetadataItem[];
        constructor(resource: Manifesto.IManifestResource, label?: string);
        addItem(item: Manifold.IMetadataItem): void;
        addMetadata(metadata: Manifesto.MetadataItem[], isRootLevel?: boolean): void;
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
    class Translation {
        value: string;
        locale: string;
        constructor(value: string, locale: string);
    }
}

declare namespace Manifold {
    class UriLabeller {
        labels: any;
        constructor(labels: Object);
        format(url: string): string;
    }
}
