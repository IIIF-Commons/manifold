import { MultiSelectState } from "./MultiSelectState";
import { IManifoldOptions } from "./IManifoldOptions";
import { Manifest, Service, ServiceProfile, LanguageMap, Canvas, ManifestType, LabelValuePair, Language, Sequence, Annotation, AnnotationBody, TreeNode, IIIFResource, Utils, Range, Thumb, ViewingDirection, ViewingHint, TreeNodeType } from "manifesto.js";
import { MetadataOptions } from "./MetadataOptions";
import { MetadataGroup } from "./MetadataGroup";
import { IMetadataItem } from "./IMetadataItem";
import { ILabelValuePair } from "./ILabelValuePair";
import { MultiSelectableCanvas } from "./MultiSelectableCanvas";
import { TreeSortType } from "./TreeSortType";
import { MultiSelectableRange } from "./MultiSelectableRange";

export class Helper {
    
    private _multiSelectState: MultiSelectState;

    public canvasIndex: number;
    public collectionIndex: number;
    public iiifResource: IIIFResource;
    public iiifResourceUri: string;
    public manifest: Manifest;
    public manifestIndex: number;
    public options: IManifoldOptions;
    public sequenceIndex: number;
    public rangeId: string | null;
    
    constructor(options: IManifoldOptions) {
        this.options = options;
        this.iiifResource = this.options.iiifResource;
        this.iiifResourceUri = this.options.manifestUri;
        this.manifest = this.options.manifest;
        this.collectionIndex = this.options.collectionIndex || 0;
        this.manifestIndex = this.options.manifestIndex || 0;
        this.sequenceIndex = this.options.sequenceIndex || 0;
        this.canvasIndex = this.options.canvasIndex || 0;
    }
    
    // getters //
    
    public getAutoCompleteService(): Service | null {
        const service: Service | null = this.getSearchService();
        
        if (service) {
            return service.getService(ServiceProfile.SEARCH_0_AUTO_COMPLETE);
        }
        
        return null;
    }
    
    public getAttribution(): string | null {

        console.warn('getAttribution will be deprecated, use getRequiredStatement instead.');
        
        const attribution: LanguageMap | null = this.manifest.getAttribution();

        if (attribution) {
            return LanguageMap.getValue(attribution, this.options.locale);
        }
        
        return null;
    }
    
    public getCanvases(): Canvas[] {
        return this.getCurrentSequence().getCanvases();
    }

    public getCanvasById(id: string): Canvas | null {
        return this.getCurrentSequence().getCanvasById(id);
    }

    public getCanvasesById(ids: string[]): Canvas[] {
        const canvases: Canvas[] = [];

        for (let i = 0; i < ids.length; i++) {
            const id: string = ids[i];
            const canvas: Canvas | null = this.getCanvasById(id);
            if (canvas) {
                canvases.push(canvas);
            }
        }

        return canvases;
    }

    public getCanvasByIndex(index: number): Canvas {
        return this.getCurrentSequence().getCanvasByIndex(index);
    }
    
    public getCanvasIndexById(id: string): number | null {
        return this.getCurrentSequence().getCanvasIndexById(id);
    }
    
    public getCanvasIndexByLabel(label: string): number {
        const foliated: boolean = this.getManifestType() === ManifestType.MANUSCRIPT;
        return this.getCurrentSequence().getCanvasIndexByLabel(label, foliated);
    }
    
    public getCanvasRange(canvas: Canvas, path?: string): Range | null {
        const ranges: Range[] = this.getCanvasRanges(canvas);
        
        if (path) {
            for (let i = 0; i < ranges.length; i++) {
                const range: Range = ranges[i];

                if (range.path === path) {
                    return range;
                }
            }

            return null;
        } else {
            return ranges[0]; // else return the first range
        }
    }

    public getCanvasRanges(canvas: Canvas): Range[] {

        if (canvas.ranges) {
            return canvas.ranges; // cache
        } else {
            // todo: write test
            canvas.ranges = <Range[]>this.manifest.getAllRanges().filter(range => (range.getCanvasIds().some(cid => Utils.normaliseUrl(cid) === Utils.normaliseUrl(canvas.id))));
        }

        return canvas.ranges;
    }

    public getCollectionIndex(iiifResource: IIIFResource): number | null {
        // todo: support nested collections. walk up parents adding to array and return csv string.
        let index: number | null = null;
        if (iiifResource.parentCollection) {
            index = iiifResource.parentCollection.index;
        }
        return index;
    }

    public getCurrentCanvas(): Canvas {
        return this.getCurrentSequence().getCanvasByIndex(this.canvasIndex);
    }
            
    public getCurrentSequence(): Sequence {
        return this.getSequenceByIndex(this.sequenceIndex);
    }

    public getDescription(): string | null {
        const description: LanguageMap | null = this.manifest.getDescription();

        if (description) {
            return LanguageMap.getValue(description, this.options.locale);
        }
        
        return null;
    }

    public getLabel(): string | null {
        const label: LanguageMap | null = this.manifest.getLabel();

        if (label) {
            return LanguageMap.getValue(label, this.options.locale);
        }
        
        return null;
    }
    
    public getLastCanvasLabel(alphanumeric?: boolean): string {
        return this.getCurrentSequence().getLastCanvasLabel(alphanumeric);
    }

    public getFirstPageIndex(): number {
        return 0; // why is this needed?
    }
    
    public getLastPageIndex(): number {
        return this.getTotalCanvases() - 1;
    }
    
    public getLicense(): string | null {
        return this.manifest.getLicense();
    }

    public getLogo(): string | null {
        return this.manifest.getLogo();
    }

    public getManifestType(): ManifestType {
        let manifestType = this.manifest.getManifestType();

        // default to monograph
        if (manifestType === ManifestType.EMPTY) {
            manifestType = ManifestType.MONOGRAPH;
        }

        return manifestType;
    }
    
    public getMetadata(options?: MetadataOptions): MetadataGroup[] {

        const metadataGroups: MetadataGroup[] = [];
        const manifestMetadata: LabelValuePair[] = this.manifest.getMetadata();
        const manifestGroup: MetadataGroup = new MetadataGroup(this.manifest);

        if (manifestMetadata && manifestMetadata.length) {
            manifestGroup.addMetadata(manifestMetadata, true);
        }

        if (this.manifest.getDescription().length) {
            const metadataItem: LabelValuePair = new LabelValuePair(this.options.locale);
            metadataItem.label = [new Language("description", this.options.locale)];
            metadataItem.value = this.manifest.getDescription();
            (<IMetadataItem>metadataItem).isRootLevel = true;
            manifestGroup.addItem(<IMetadataItem>metadataItem);
        }

        if (this.manifest.getAttribution().length) {
            const metadataItem: LabelValuePair = new LabelValuePair(this.options.locale);
            metadataItem.label = [new Language("attribution", this.options.locale)];
            metadataItem.value = this.manifest.getAttribution();
            (<IMetadataItem>metadataItem).isRootLevel = true;
            manifestGroup.addItem(<IMetadataItem>metadataItem);
        }

        const license: string | null = this.manifest.getLicense();

        if (license) {
            const item: any = {
                label: "license",
                value: (options && options.licenseFormatter) ? options.licenseFormatter.format(license) : license
            };
            const metadataItem: LabelValuePair = new LabelValuePair(this.options.locale);
            metadataItem.parse(item);
            (<IMetadataItem>metadataItem).isRootLevel = true;
            manifestGroup.addItem(<IMetadataItem>metadataItem);
        }

        if (this.manifest.getLogo()) {
            const item: any = {
                label: "logo",
                value: '<img src="' + this.manifest.getLogo() + '"/>'
            };
            const metadataItem: LabelValuePair = new LabelValuePair(this.options.locale);
            metadataItem.parse(item);
            (<IMetadataItem>metadataItem).isRootLevel = true;
            manifestGroup.addItem(<IMetadataItem>metadataItem);
        }

        metadataGroups.push(manifestGroup);

        if (options) {
            return this._parseMetadataOptions(options, metadataGroups);
        } else {
            return metadataGroups;
        }
    }

    public getRequiredStatement(): ILabelValuePair | null {
        const requiredStatement: LabelValuePair | null = this.manifest.getRequiredStatement();

        if (requiredStatement) {
            return {
                label: requiredStatement.getLabel(),
                value: requiredStatement.getValue()
            }
        }
        
        return null;
    }

    private _parseMetadataOptions(options: MetadataOptions, metadataGroups: MetadataGroup[]): MetadataGroup[] {

        // get sequence metadata
        const sequence: Sequence = this.getCurrentSequence();
        const sequenceMetadata: any[] = sequence.getMetadata();

        if (sequenceMetadata && sequenceMetadata.length) {
            const sequenceGroup: MetadataGroup = new MetadataGroup(sequence);
            sequenceGroup.addMetadata(sequenceMetadata);
            metadataGroups.push(sequenceGroup);
        }

        // get range metadata
        if (options.range) {
            let rangeGroups: MetadataGroup[] = this._getRangeMetadata([], options.range);
            rangeGroups = rangeGroups.reverse();
            metadataGroups = metadataGroups.concat(rangeGroups);
        }

        // get canvas metadata
        if (options.canvases && options.canvases.length) {
            for (let i = 0; i < options.canvases.length; i++) {
                const canvas: Canvas = options.canvases[i];
                const canvasMetadata: any[] = canvas.getMetadata();

                if (canvasMetadata && canvasMetadata.length) {
                    const canvasGroup: MetadataGroup = new MetadataGroup(canvas);
                    canvasGroup.addMetadata(canvas.getMetadata());
                    metadataGroups.push(canvasGroup);
                }

                // add image metadata
                const images: Annotation[] = canvas.getImages();

                for (let j = 0; j < images.length; j++) {
                    const image: Annotation = images[j];
                    const imageMetadata: any[] = image.getMetadata();

                    if (imageMetadata && imageMetadata.length) {
                        const imageGroup: MetadataGroup = new MetadataGroup(image);
                        imageGroup.addMetadata(imageMetadata);
                        metadataGroups.push(imageGroup);
                    }
                }
            }
        }

        return metadataGroups;
    }

    private _getRangeMetadata(metadataGroups: MetadataGroup[], range: Range): MetadataGroup[] {
        const rangeMetadata: any[] = range.getMetadata();

        if (rangeMetadata && rangeMetadata.length) {
            const rangeGroup: MetadataGroup = new MetadataGroup(range);
            rangeGroup.addMetadata(rangeMetadata);
            metadataGroups.push(rangeGroup);
        } else if (range.parentRange) {
            return this._getRangeMetadata(metadataGroups, range.parentRange);
        }
        
        return metadataGroups;
    }

    public getMultiSelectState(): MultiSelectState {
        if (!this._multiSelectState) {
            this._multiSelectState = new MultiSelectState();
            this._multiSelectState.ranges = this.getRanges().slice(0) as MultiSelectableRange[];
            this._multiSelectState.canvases = <MultiSelectableCanvas[]>this.getCurrentSequence().getCanvases().slice(0);
        }

        return this._multiSelectState;
    }

    public getCurrentRange(): Range | null {
        if (this.rangeId) {
            return this.getRangeById(this.rangeId);
        }

        return null;            
    }

    public getPosterCanvas(): Canvas | null {
        return this.manifest.getPosterCanvas();
    }

    public getPosterImage(): string | null {
        const posterCanvas: Canvas | null = this.getPosterCanvas();

        if (posterCanvas) {
            const content: Annotation[] = posterCanvas.getContent();

            if (content && content.length) {
                const anno: Annotation = content[0];
                const body: AnnotationBody[] = anno.getBody();
                return body[0].id;
            }
        }

        return null;
    }

    public getPreviousRange(range?: Range): Range | null {

        let currentRange: Range | null = null;

        if (range) {
            currentRange = range;
        } else {
            currentRange = this.getCurrentRange();
        }

        if (currentRange) {
            const flatTree: TreeNode[] | null = this.getFlattenedTree();
            
            if (flatTree) {
                for (let i = 0; i < flatTree.length; i++) {
                    const node: TreeNode | null = flatTree[i];
                    
                    // find current range in flattened tree
                    if (node && node.data.id === (<Range>currentRange).id) {
                        // find the first node before it that has canvases
                        while (i > 0) {
                            i--;
                            const prevNode: TreeNode = flatTree[i];
                            return prevNode.data;
                        }
                        
                        break;
                    }
                }
            }
        }

        return null;
    }

    public getNextRange(range?: Range): Range | null {

        // if a range is passed, use that. otherwise get the current range.
        let currentRange: Range | null = null;

        if (range) {
            currentRange = range;
        } else {
            currentRange = this.getCurrentRange();
        }

        if (currentRange) {
            const flatTree: TreeNode[] | null = this.getFlattenedTree();
            
            if (flatTree) {
                for (let i = 0; i < flatTree.length; i++) {
                    const node: TreeNode = flatTree[i];
                    
                    // find current range in flattened tree
                    if (node && node.data.id === (<Range>currentRange).id) {

                        // find the first node after it that has canvases
                        while (i < flatTree.length - 1) {
                            i++;
                            const nextNode: TreeNode = flatTree[i];
                            if (nextNode.data.canvases && nextNode.data.canvases.length) {
                                return nextNode.data;
                            }
                        }

                        break;
                    }
                }
            }
        }

        return null;
    }

    public getFlattenedTree(treeNode?: TreeNode): TreeNode[] | null {

        let t: TreeNode | null = null;

        if (!treeNode) {
            t = this.getTree();
        } else {
            t = treeNode;
        }

        if (t) {
            return this._flattenTree(t, 'nodes');
        }

        return null;
    }

    private _flattenTree(root: TreeNode, key: string): TreeNode[] {
        let flatten: TreeNode[] = [Object.assign({}, root)];
        delete flatten[0][key];
        
        if (root[key] && root[key].length > 0) {
            return flatten.concat(root[key]
                .map((child) => this._flattenTree(child, key))
                .reduce((a, b) => a.concat(b), [])
            );
        }
        
        return flatten;
    }

    public getRanges(): Range[] {
        return <Range[]>(<Manifest>this.manifest).getAllRanges();
    }
    
    public getRangeByPath(path: string): Range | null {
        return this.manifest.getRangeByPath(path);
    }

    public getRangeById(id: string): Range | null {
        return this.manifest.getRangeById(id);
    }
    
    public getRangeCanvases(range: Range): Canvas[] {
        const ids: string[] = range.getCanvasIds();
        return this.getCanvasesById(ids);
    }

    public getRelated(): any {
        return this.manifest.getRelated();
    }
    
    public getSearchService(): Service | null {
        return this.manifest.getService(ServiceProfile.SEARCH_0);
    }
    
    public getSeeAlso(): any {
        return this.manifest.getSeeAlso();
    }

    public getSequenceByIndex(index: number): Sequence {
        return this.manifest.getSequenceByIndex(index);
    }

    public getShareServiceUrl(): string | null {
        let url: string | null = null;
        let shareService: Service | null = this.manifest.getService(ServiceProfile.SHARE_EXTENSIONS);

        if (shareService) {
            if ((<any>shareService).length) {
                shareService = (<any>shareService)[0];
            }
            url = (<any>shareService).__jsonld.shareUrl;
        }

        return url;
    }

    private _getSortedTreeNodesByDate(sortedTree: TreeNode, tree: TreeNode): void{

        // const all: TreeNode[] = <TreeNode[]>tree.nodes.en().traverseUnique(node => node.nodes)
        //     .where((n) => n.data.type === TreeNodeType.COLLECTION ||
        //                 n.data.type === TreeNodeType.MANIFEST).toArray();

        const flattenedTree: TreeNode[] | null = this.getFlattenedTree(tree);

        // const manifests: TreeNode[] = <TreeNode[]>tree.nodes.en().traverseUnique(n => n.nodes)
        //     .where((n) => n.data.type === TreeNodeType.MANIFEST).toArray();

        if (flattenedTree) {
            const manifests: TreeNode[] = flattenedTree.filter((n) => n.data.type === TreeNodeType.MANIFEST);

            this.createDecadeNodes(sortedTree, flattenedTree);
            this.sortDecadeNodes(sortedTree);
            this.createYearNodes(sortedTree, flattenedTree);
            this.sortYearNodes(sortedTree);
            this.createMonthNodes(sortedTree, manifests);
            this.sortMonthNodes(sortedTree);
            this.createDateNodes(sortedTree, manifests);
    
            this.pruneDecadeNodes(sortedTree);
        }
    }
    
    public getStartCanvasIndex(): number {
        return this.getCurrentSequence().getStartCanvasIndex();
    }
    
    public getThumbs(width: number, height: number): Thumb[] {
        return this.getCurrentSequence().getThumbs(width, height);
    }
    
    public getTopRanges(): Range[] {
        return this.manifest.getTopRanges();
    }

    public getTotalCanvases(): number {
        return this.getCurrentSequence().getTotalCanvases();
    }

    public getTrackingLabel(): string {
        return this.manifest.getTrackingLabel();
    }

    private _getTopRanges(): Range[] {
        return (<Manifest>this.iiifResource).getTopRanges();
    }

    public getTree(topRangeIndex: number = 0, sortType: TreeSortType = TreeSortType.NONE): TreeNode | null {

        // if it's a collection, use IIIFResource.getDefaultTree()
        // otherwise, get the top range by index and use Range.getTree()

        if (!this.iiifResource) {
            return null;
        }

        let tree: TreeNode;

        if (this.iiifResource.isCollection()) {
            tree = this.iiifResource.getDefaultTree();
        } else {
            const topRanges: Range[] = this._getTopRanges();
            
            const root: TreeNode = new TreeNode();
            root.label = 'root';
            root.data = this.iiifResource;
            
            if (topRanges.length) {
                const range: Range = topRanges[topRangeIndex];                    
                tree = range.getTree(root);
            } else {
                return root;
            }
        }

        let sortedTree: TreeNode = new TreeNode();
        
        switch (sortType) {
            case TreeSortType.DATE:
                // returns a list of treenodes for each decade.
                // expanding a decade generates a list of years
                // expanding a year gives a list of months containing issues
                // expanding a month gives a list of issues.
                if (this.treeHasNavDates(tree)){
                    this._getSortedTreeNodesByDate(sortedTree, tree);
                    break;
                }                    
            default:
                sortedTree = tree;
        }
        
        return sortedTree;
    }
    
    public treeHasNavDates(tree: TreeNode): boolean {
        //const node: TreeNode = tree.nodes.en().traverseUnique(node => node.nodes).where((n) => !isNaN(<any>n.navDate)).first();
        // todo: write test

        const flattenedTree: TreeNode[] | null = this.getFlattenedTree(tree);

        return (flattenedTree) ? flattenedTree.some(n => !isNaN(<any>n.navDate)) : false;
    }
    
    public getViewingDirection(): ViewingDirection | null {
        let viewingDirection: ViewingDirection | null = this.getCurrentSequence().getViewingDirection();

        if (!viewingDirection) {
            viewingDirection = this.manifest.getViewingDirection();
        }

        return viewingDirection;
    }

    public getViewingHint(): ViewingHint | null {
        let viewingHint: ViewingHint | null = this.getCurrentSequence().getViewingHint();

        if (!viewingHint) {
            viewingHint = this.manifest.getViewingHint();
        }

        return viewingHint;
    }

    
    // inquiries //
    
    public hasParentCollection(): boolean {
        return !!this.manifest.parentCollection;
    }

    public hasRelatedPage(): boolean {
        let related: any = this.getRelated();
        if (!related) return false;
        if (related.length){
            related = related[0];
        }
        return related['format'] === 'text/html';
    }

    public hasResources(): boolean {
        const canvas: Canvas = this.getCurrentCanvas();
        return canvas.getResources().length > 0;
    }
    
    public isBottomToTop(): boolean {

        const viewingDirection: ViewingDirection | null = this.getViewingDirection();

        if (viewingDirection) {
            return viewingDirection === ViewingDirection.BOTTOM_TO_TOP;
        }
        
        return false;
    }
    
    public isCanvasIndexOutOfRange(index: number): boolean {
        return this.getCurrentSequence().isCanvasIndexOutOfRange(index);
    }
    
    public isContinuous(): boolean {

        const viewingHint: ViewingHint | null = this.getViewingHint();

        if (viewingHint) {
            return viewingHint === ViewingHint.CONTINUOUS;
        }

        return false;
    }
    
    public isFirstCanvas(index?: number): boolean {
        if (typeof index !== 'undefined') {
            return this.getCurrentSequence().isFirstCanvas(index);
        }
        
        return this.getCurrentSequence().isFirstCanvas(this.canvasIndex);
    }
    
    public isHorizontallyAligned(): boolean {
        return this.isLeftToRight() || this.isRightToLeft()
    }
    
    public isLastCanvas(index?: number): boolean {
        if (typeof index !== 'undefined') {
            return this.getCurrentSequence().isLastCanvas(index);
        }
        
        return this.getCurrentSequence().isLastCanvas(this.canvasIndex);
    }
    
    public isLeftToRight(): boolean {

        const viewingDirection: ViewingDirection | null = this.getViewingDirection();

        if (viewingDirection) {
            return viewingDirection === ViewingDirection.LEFT_TO_RIGHT;
        }

        return false;
    }
    
    public isMultiCanvas(): boolean{
        return this.getCurrentSequence().isMultiCanvas();
    }
    
    public isMultiSequence(): boolean{
        return this.manifest.isMultiSequence();
    }
    
    public isPaged(): boolean {

        // check the sequence for a viewingHint (deprecated)
        const viewingHint: ViewingHint | null = this.getViewingHint();

        if (viewingHint) {
            return viewingHint === ViewingHint.PAGED;
        }

        // check the manifest for a viewingHint (deprecated) or paged behavior
        return this.manifest.isPagingEnabled();
    }
    
    public isPagingAvailable(): boolean {
        // paged mode is useless unless you have at least 3 pages...
        return this.isPagingEnabled() && this.getTotalCanvases() > 2;
    }
    
    public isPagingEnabled(): boolean {
        return (this.manifest.isPagingEnabled() || this.getCurrentSequence().isPagingEnabled());
    }
    
    public isRightToLeft(): boolean {

        const viewingDirection: ViewingDirection | null = this.getViewingDirection();

        if (viewingDirection) {
            return viewingDirection === ViewingDirection.RIGHT_TO_LEFT;
        }
        
        return false;
    }
    
    public isTopToBottom(): boolean {

        const viewingDirection: ViewingDirection | null = this.getViewingDirection();

        if (viewingDirection) {
            return viewingDirection === ViewingDirection.TOP_TO_BOTTOM;
        }

        return false;
    }
    
    public isTotalCanvasesEven(): boolean {
        return this.getCurrentSequence().isTotalCanvasesEven();
    }

    public isUIEnabled(name: string): boolean {
        const uiExtensions: Service | null = this.manifest.getService(ServiceProfile.UI_EXTENSIONS);

        if (uiExtensions) {
            const disableUI: string[] = uiExtensions.getProperty('disableUI');

            if (disableUI) {
                if (disableUI.indexOf(name) !== -1 || disableUI.indexOf(name.toLowerCase()) !== -1) {
                    return false;
                }
            }
        }

        return true;
    }
    
    public isVerticallyAligned(): boolean {
        return this.isTopToBottom() || this.isBottomToTop()
    }
    

    // dates //     
    
    public createDateNodes(rootNode: TreeNode, nodes: TreeNode[]): void {
        for (let i = 0; i < nodes.length; i++) {
            const node: TreeNode = <TreeNode>nodes[i];
            const year: number = this.getNodeYear(node);
            const month: number = this.getNodeMonth(node);

            const dateNode: TreeNode = new TreeNode();
            dateNode.id = node.id;
            dateNode.label = this.getNodeDisplayDate(node);
            dateNode.data = node.data;
            dateNode.data.type = TreeNodeType.MANIFEST;
            dateNode.data.year = year;
            dateNode.data.month = month;

            const decadeNode: TreeNode | null = this.getDecadeNode(rootNode, year);

            if (decadeNode) {
                const yearNode: TreeNode | null = this.getYearNode(decadeNode, year);

                if (yearNode) {
                    const monthNode: TreeNode | null = this.getMonthNode(yearNode, month);

                    if (monthNode){
                        monthNode.addNode(dateNode);
                    }
                }
            }
        }
    }
    
    public createDecadeNodes(rootNode: TreeNode, nodes: TreeNode[]): void {

        for (let i = 0; i < nodes.length; i++) {
            const node: TreeNode = nodes[i];
            const year: number = this.getNodeYear(node);
            const endYear: number = Number(year.toString().substr(0, 3) + "9");

            if (!this.getDecadeNode(rootNode, year)) {
                const decadeNode: TreeNode = new TreeNode();
                decadeNode.label = year + " - " + endYear;
                decadeNode.navDate = node.navDate;
                decadeNode.data.startYear = year;
                decadeNode.data.endYear = endYear;
                rootNode.addNode(decadeNode);
            }
        }
    }
    
    public createMonthNodes(rootNode: TreeNode, nodes: TreeNode[]): void{

        for (let i = 0; i < nodes.length; i++) {
            const node: TreeNode = nodes[i];
            const year = this.getNodeYear(node);
            const month = this.getNodeMonth(node);
            const decadeNode: TreeNode | null = this.getDecadeNode(rootNode, year);
            let yearNode: TreeNode | null = null;
            
            if (decadeNode) {
                yearNode = this.getYearNode(decadeNode, year);
            }

            if (decadeNode && yearNode && !this.getMonthNode(yearNode, month)) {
                const monthNode: TreeNode = new TreeNode();
                monthNode.label = this.getNodeDisplayMonth(node);
                monthNode.navDate = node.navDate;
                monthNode.data.year = year;
                monthNode.data.month = month;
                yearNode.addNode(monthNode);
            }
        }
    }
    
    public createYearNodes(rootNode: TreeNode, nodes: TreeNode[]): void{

        for (let i = 0; i < nodes.length; i++) {
            const node: TreeNode = nodes[i];
            const year: number = this.getNodeYear(node);
            const decadeNode: TreeNode | null = this.getDecadeNode(rootNode, year);

            if (decadeNode && !this.getYearNode(decadeNode, year)) {
                const yearNode: TreeNode = new TreeNode();
                yearNode.label = year.toString();
                yearNode.navDate = node.navDate;
                yearNode.data.year = year;

                decadeNode.addNode(yearNode);
            }
        }
    }
    
    public getDecadeNode(rootNode: TreeNode, year: number): TreeNode | null {
        for (let i = 0; i < rootNode.nodes.length; i++) {
            const n: TreeNode = <TreeNode>rootNode.nodes[i];
            if (year >= n.data.startYear && year <= n.data.endYear) return n;
        }

        return null;
    }
    
    public getMonthNode(yearNode: TreeNode, month: Number): TreeNode | null {
        for (let i = 0; i < yearNode.nodes.length; i++) {
            const n: TreeNode = <TreeNode>yearNode.nodes[i];
            if (month === this.getNodeMonth(n)) return n;
        }

        return null;
    }
    
    public getNodeDisplayDate(node: TreeNode): string{
        return node.navDate.toDateString();
    }
    
    public getNodeDisplayMonth(node: TreeNode): string{
        const months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[node.navDate.getMonth()];
    }        

    public getNodeMonth(node: TreeNode): number{
        return node.navDate.getMonth();
    }
    
    public getNodeYear(node: TreeNode): number{
        return node.navDate.getFullYear();
    }

    public getYearNode(decadeNode: TreeNode, year: Number): TreeNode | null {
        for (let i = 0; i < decadeNode.nodes.length; i++){
            const n: TreeNode = <TreeNode>decadeNode.nodes[i];
            if (year === this.getNodeYear(n)) return n;
        }

        return null;
    }
    
    // delete any empty decades
    public pruneDecadeNodes(rootNode: TreeNode): void {
        const pruned: TreeNode[] = [];

        for (let i = 0; i < rootNode.nodes.length; i++) {
            const n: TreeNode = <TreeNode>rootNode.nodes[i];
            if (!n.nodes.length) {
                pruned.push(n);
            }
        }

        for (let j = 0; j < pruned.length; j++) {
            const p: TreeNode = <TreeNode>pruned[j];
            const index: number = rootNode.nodes.indexOf(p);

            if (index > -1) {
                rootNode.nodes.splice(index, 1);
            }
        }
    }

    public sortDecadeNodes(rootNode: TreeNode): void {
        rootNode.nodes = rootNode.nodes.sort(function(a, b) {
            return a.data.startYear - b.data.startYear;
        });
    }
    
    public sortMonthNodes(rootNode: TreeNode): void {
        for (let i = 0; i < rootNode.nodes.length; i++) {
            const decadeNode: TreeNode = rootNode.nodes[i];

            for (let j = 0; j < decadeNode.nodes.length; j++){
                const monthNode: TreeNode = decadeNode.nodes[j];

                monthNode.nodes = monthNode.nodes.sort((a: TreeNode, b: TreeNode) => {
                    return this.getNodeMonth(a) - this.getNodeMonth(b);
                });
            }
        }
    }
    
    public sortYearNodes(rootNode: TreeNode): void {
        for (let i = 0; i < rootNode.nodes.length; i++) {
            const decadeNode: TreeNode = rootNode.nodes[i];

            decadeNode.nodes = decadeNode.nodes.sort((a: TreeNode, b: TreeNode) => {
                return (this.getNodeYear(a) - this.getNodeYear(b));
            });
        }
    }        
}