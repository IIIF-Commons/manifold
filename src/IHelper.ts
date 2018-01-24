namespace Manifold {
    
    export interface IHelper {
        
        canvasIndex: number;
        collectionIndex: number;
        iiifResource: Manifesto.IIIIFResource;
        iiifResourceUri: string;
        manifest: Manifesto.IManifest;
        manifestIndex: number;
        options: IManifoldOptions;
        sequenceIndex: number;
        rangeId: string | null;
        
        // getters //
        
        getAttribution(): string | null;
        getAutoCompleteService(): Manifesto.IService | null;
        getCanvasById(id: string): Manifesto.ICanvas | null;
        getCanvasByIndex(index: number): Manifesto.ICanvas;
        getCanvases(): Manifesto.ICanvas[];
        getCanvasesById(ids: string[]): Manifesto.ICanvas[];
        getCanvasIndexById(id: string): number | null;
        getCanvasIndexByLabel(label: string): number;
        getCanvasRange(canvas: Manifesto.ICanvas, path?: string): Manifesto.IRange | null;
        getCanvasRanges(canvas: Manifesto.ICanvas): Manifesto.IRange[];
        getCollectionIndex(iiifResource: Manifesto.IIIIFResource): number | null;
        getCurrentCanvas(): Manifesto.ICanvas;
        getCurrentRange(): Manifesto.IRange | null;
        getCurrentSequence(): Manifesto.ISequence;
        getDescription(): string | null;
        getFirstPageIndex(): number;
        getLabel(): string | null;
        getLastCanvasLabel(alphanumeric?: boolean): string;
        getLastPageIndex(): number;
        getLicense(): string | null;
        getLogo(): string | null;
        getManifestType(): Manifesto.ManifestType;
        getMetadata(options?: MetadataOptions): Manifold.MetadataGroup[];
        getMultiSelectState(): Manifold.MultiSelectState;      
        getNextRange(range?: Manifesto.IRange): Manifesto.IRange | null;
        getPreviousRange(range?: Manifesto.IRange): Manifesto.IRange | null;
        getRangeById(id: string): Manifesto.IRange | null;
        getRangeByPath(path: string): Manifesto.IRange | null;
        getRangeCanvases(range: Manifesto.IRange): Manifesto.ICanvas[];
        getRanges(): IRange[];
        getRelated(): any;
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
        
        // inquiries //
        
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