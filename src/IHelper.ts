module Manifold {
    
    export interface IHelper {
        
        iiifResource: Manifesto.IIIIFResource;
        iiifResourceUri: string;
        manifest: Manifesto.IManifest;
        collectionIndex: number;
        manifestIndex: number;
        canvasIndex: number;
        sequenceIndex: number;        
        
        // getters //
        
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
        
        // inquiries //
        
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