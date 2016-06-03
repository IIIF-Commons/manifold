namespace Manifold {
    
    export class ManifestHelper {
        
        public manifest: Manifesto.IManifest;        
        public canvasIndex: number;
        public sequenceIndex: number;        
        private _licenseFormatter: Manifold.UriLabeller;
        
        constructor(options: IManifestHelperOptions){
            this.manifest = options.manifest;
            this._licenseFormatter = new Manifold.UriLabeller(options.licenseMap || {});
            this.canvasIndex = options.canvasIndex || 0;
            this.sequenceIndex = options.sequenceIndex || 0;
        }

        public getAttribution(): string {
            return this.manifest.getAttribution();
        }
        
        public getCanvases(): Manifesto.ICanvas[] {
            return this.getCurrentSequence().getCanvases();
        }

        public getCanvasById(id: string): Manifesto.ICanvas {
            return this.getCurrentSequence().getCanvasById(id);
        }

        public getCanvasesById(ids: string[]): Manifesto.ICanvas[] {
            var canvases: Manifesto.ICanvas[] = [];

            for (var i = 0; i < ids.length; i++) {
                var id: string = ids[i];
                canvases.push(this.getCanvasById(id));
            }

            return canvases;
        }

        public getCanvasByIndex(index: number): Manifesto.ICanvas {
            return this.getCurrentSequence().getCanvasByIndex(index);
        }

        public getCanvasRange(canvas: Manifesto.ICanvas): Manifesto.IRange {
            // get ranges that contain the canvas id. return the last.
            return this.getCanvasRanges(canvas).last();
        }

        public getCanvasRanges(canvas: Manifesto.ICanvas): Manifesto.IRange[] {

            if (canvas.ranges){
                return canvas.ranges;
            } else {
                canvas.ranges = <IRange[]>this.manifest.getRanges().en().where(range => (range.getCanvasIds().en().any(c => c === canvas.id))).toArray();
            }

            return canvas.ranges;
        }

        public getCurrentCanvas(): Manifesto.ICanvas {
            return this.getCurrentSequence().getCanvasByIndex(this.canvasIndex);
        }

        public getCurrentSequence(): Manifesto.ISequence {
            return this.getSequenceByIndex(this.sequenceIndex);
        }
        
        public getCollectionIndex(iiifResource: Manifesto.IIIIFResource): number {
            // todo: support nested collections. walk up parents adding to array and return csv string.
            var index: number;
            if (iiifResource.parentCollection) {
                index = iiifResource.parentCollection.index;
            }
            return index;
        }

        public getElementType(element?: Manifesto.IElement): Manifesto.ElementType {
            if (!element){
                element = this.getCurrentCanvas();
            }
            return element.getType();
        }
        
        public getLabel(): string {
            return this.manifest.getLabel();
        }
        
        public getLastCanvasLabel(alphanumeric?: boolean): string {
            return this.getCurrentSequence().getLastCanvasLabel(alphanumeric);
        }
        
        public getLicense(): string {
            return this.manifest.getLicense();
        }

        public getLogo(): string {
            return this.manifest.getLogo();
        }

        public getManifestType(): Manifesto.ManifestType{
            var manifestType = this.manifest.getManifestType();

            // default to monograph
            if (manifestType.toString() === ""){
                manifestType = manifesto.ManifestType.monograph();
            }

            return manifestType;
        }

        public getMultiSelectState(): Manifold.MultiSelectState {
            var m: Manifold.MultiSelectState = new Manifold.MultiSelectState();
            m.ranges = this.getRanges();
            m.canvases = this.getCurrentSequence().getCanvases();
            return m;
        }

        public getSeeAlso(): any {
            return this.manifest.getSeeAlso();
        }
        
        public getSequenceByIndex(index: number): Manifesto.ISequence {
            return this.manifest.getSequenceByIndex(index);
        }
        
        public isCanvasIndexOutOfRange(index: number): boolean {
            return this.getCurrentSequence().isCanvasIndexOutOfRange(index);
        }
        
        public isFirstCanvas(index?: number): boolean {
            return this.getCurrentSequence().isFirstCanvas(index);
        }
        
        public isLastCanvas(index?: number): boolean {
            return this.getCurrentSequence().isLastCanvas(index);
        }
        
        public isMultiSequence(): boolean{
            return this.manifest.isMultiSequence();
        }

        public isTotalCanvasesEven(): boolean {
            return this.getCurrentSequence().isTotalCanvasesEven();
        }

        public getRangeCanvases(range: Manifesto.IRange): Manifesto.ICanvas[] {
            var ids: string[] = range.getCanvasIds();
            return this.getCanvasesById(ids);
        }

        public getTotalCanvases(): number{
            return this.getCurrentSequence().getTotalCanvases();
        }

        public isMultiCanvas(): boolean{
            return this.getCurrentSequence().isMultiCanvas();
        }

        public isUIEnabled(name: string): boolean {
            var uiExtensions: Manifesto.IService = this.manifest.getService(manifesto.ServiceProfile.uiExtensions());

            if (uiExtensions){
                var disableUI: string[] = uiExtensions.getProperty('disableUI');

                if (disableUI) {
                    if (disableUI.contains(name) || disableUI.contains(name.toLowerCase())) {
                        return false;
                    }
                }
            }

            return true;
        }

        public getInfoUri(canvas: Manifesto.ICanvas): string{
            // default to IxIF
            var service = canvas.getService(manifesto.ServiceProfile.ixif());

            if (service){ // todo: deprecate
                return service.getInfoUri();
            }

            // return the canvas id.
            return canvas.id;
        }

        public getPagedIndices(canvasIndex?: number): number[]{
            if (typeof(canvasIndex) === 'undefined') canvasIndex = this.canvasIndex;

            return [canvasIndex];
        }

        public getViewingDirection(): Manifesto.ViewingDirection {
            var viewingDirection: Manifesto.ViewingDirection = this.getCurrentSequence().getViewingDirection();

            if (!viewingDirection.toString()) {
                viewingDirection = this.manifest.getViewingDirection();
            }

            return viewingDirection;
        }

        public getViewingHint(): Manifesto.ViewingHint {
            var viewingHint: Manifesto.ViewingHint = this.getCurrentSequence().getViewingHint();

            if (!viewingHint.toString()) {
                viewingHint = this.manifest.getViewingHint();
            }

            return viewingHint;
        }

        public getFirstPageIndex(): number {
            return 0;
        }

        public getLastPageIndex(): number {
            return this.getTotalCanvases() - 1;
        }

        public getStartCanvasIndex(): number {
            return this.getCurrentSequence().getStartCanvasIndex();
        }

        public getThumbs(width: number, height: number): Manifesto.IThumb[] {
            return this.getCurrentSequence().getThumbs(width, height);
        }

        public getRangeByPath(path: string): any{
            return this.manifest.getRangeByPath(path);
        }

        public getCanvasIndexById(id: string): number {
            return this.getCurrentSequence().getCanvasIndexById(id);
        }

        public getCanvasIndexByLabel(label: string): number {
            var foliated = this.getManifestType().toString() === manifesto.ManifestType.manuscript().toString();
            return this.getCurrentSequence().getCanvasIndexByLabel(label, foliated);
        }
        
        public getRanges(): IRange[] {
            return <IRange[]>(<Manifesto.IManifest>this.manifest).getRanges();
        }
        
        public getTree(): Manifesto.ITreeNode{
            return this.manifest.getTree();
        }
        
        // returns a list of treenodes for each decade.
        // expanding a decade generates a list of years
        // expanding a year gives a list of months containing issues
        // expanding a month gives a list of issues.
        public getSortedTree(sortType: TreeSortType): ITreeNode {

            var tree: ITreeNode = <ITreeNode>this.manifest.getTree();
            var sortedTree: ITreeNode = <ITreeNode>manifesto.getTreeNode();

            if (sortType === TreeSortType.date){
                this.getSortedTreeNodesByDate(sortedTree, tree);
            } else if (sortType === TreeSortType.none) {
                sortedTree = tree;
            }

            return sortedTree;
        }

        public getSortedTreeNodesByDate(sortedTree: ITreeNode, tree: ITreeNode): void{

            var all: ITreeNode[] = <ITreeNode[]>tree.nodes.en().traverseUnique(node => node.nodes)
                .where((n) => n.data.type === manifesto.TreeNodeType.collection().toString() ||
                            n.data.type === manifesto.TreeNodeType.manifest().toString()).toArray();

            //var collections: ITreeNode[] = tree.nodes.en().traverseUnique(n => n.nodes)
            //    .where((n) => n.data.type === ITreeNodeType.collection().toString()).toArray();

            var manifests: ITreeNode[] = <ITreeNode[]>tree.nodes.en().traverseUnique(n => n.nodes)
                .where((n) => n.data.type === manifesto.TreeNodeType.manifest().toString()).toArray();

            this.createDecadeNodes(sortedTree, all);
            this.sortDecadeNodes(sortedTree);
            this.createYearNodes(sortedTree, all);
            this.sortYearNodes(sortedTree);
            this.createMonthNodes(sortedTree, manifests);
            this.sortMonthNodes(sortedTree);
            this.createDateNodes(sortedTree, manifests);

            this.pruneDecadeNodes(sortedTree);
        }

        public createDecadeNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void{
            var decadeNode: ITreeNode;

            for (var i = 0; i < nodes.length; i++) {
                var node: ITreeNode = nodes[i];
                var year = this.getNodeYear(node);
                var decade = Number(year.toString().substr(2, 1));
                var endYear = Number(year.toString().substr(0, 3) + "9");

                if(!this.getDecadeNode(rootNode, year)){
                    decadeNode = <ITreeNode>manifesto.getTreeNode();
                    decadeNode.label = year + " - " + endYear;
                    decadeNode.navDate = node.navDate;
                    decadeNode.data.startYear = year;
                    decadeNode.data.endYear = endYear;
                    rootNode.addNode(decadeNode);
                }
            }
        }

        // delete any empty decades
        public pruneDecadeNodes(rootNode: ITreeNode): void {
            var pruned: ITreeNode[] = [];

            for (var i = 0; i < rootNode.nodes.length; i++){
                var n: ITreeNode = <ITreeNode>rootNode.nodes[i];
                if (!n.nodes.length){
                    pruned.push(n);
                }
            }

            for (var j = 0; j < pruned.length; j++){
                var p: ITreeNode = <ITreeNode>pruned[j];

                rootNode.nodes.remove(p);
            }
        }

        public sortDecadeNodes(rootNode: ITreeNode): void {
            rootNode.nodes = rootNode.nodes.sort(function(a, b) {
                return a.data.startYear - b.data.startYear;
            });
        }

        public getDecadeNode(rootNode: ITreeNode, year: number): ITreeNode{
            for (var i = 0; i < rootNode.nodes.length; i++){
                var n: ITreeNode = <ITreeNode>rootNode.nodes[i];
                if (year >= n.data.startYear && year <= n.data.endYear) return n;
            }

            return null;
        }

        public createYearNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void{
            var yearNode: ITreeNode;

            for (var i = 0; i < nodes.length; i++) {
                var node: ITreeNode = nodes[i];
                var year = this.getNodeYear(node);
                var decadeNode = this.getDecadeNode(rootNode, year);

                if(decadeNode && !this.getYearNode(decadeNode, year)){
                    yearNode = <ITreeNode>manifesto.getTreeNode();
                    yearNode.label = year.toString();
                    yearNode.navDate = node.navDate;
                    yearNode.data.year = year;

                    decadeNode.addNode(yearNode);
                }
            }
        }

        public sortYearNodes(rootNode: ITreeNode): void {
            for (var i = 0; i < rootNode.nodes.length; i++){
                var decadeNode = rootNode.nodes[i];

                decadeNode.nodes = decadeNode.nodes.sort((a: ITreeNode, b: ITreeNode) => {
                    return (this.getNodeYear(a) - this.getNodeYear(b));
                });
            }
        }

        public getYearNode(decadeNode: ITreeNode, year: Number): ITreeNode{
            for (var i = 0; i < decadeNode.nodes.length; i++){
                var n: ITreeNode = <ITreeNode>decadeNode.nodes[i];
                if (year === this.getNodeYear(n)) return n;
            }

            return null;
        }

        public createMonthNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void{
            var monthNode: ITreeNode;

            for (var i = 0; i < nodes.length; i++) {
                var node: ITreeNode = nodes[i];
                var year = this.getNodeYear(node);
                var month = this.getNodeMonth(node);
                var decadeNode = this.getDecadeNode(rootNode, year);
                var yearNode = this.getYearNode(decadeNode, year);

                if (decadeNode && yearNode && !this.getMonthNode(yearNode, month)){
                    monthNode = <ITreeNode>manifesto.getTreeNode();
                    monthNode.label = this.getNodeDisplayMonth(node);
                    monthNode.navDate = node.navDate;
                    monthNode.data.year = year;
                    monthNode.data.month = month;
                    yearNode.addNode(monthNode);
                }
            }
        }

        public sortMonthNodes(rootNode: ITreeNode): void {
            for (var i = 0; i < rootNode.nodes.length; i++){
                var decadeNode = rootNode.nodes[i];

                for (var j = 0; j < decadeNode.nodes.length; j++){
                    var monthNode = decadeNode.nodes[j];

                    monthNode.nodes = monthNode.nodes.sort((a: ITreeNode, b: ITreeNode) => {
                        return this.getNodeMonth(a) - this.getNodeMonth(b);
                    });
                }
            }
        }

        public getMonthNode(yearNode: ITreeNode, month: Number): ITreeNode{
            for (var i = 0; i < yearNode.nodes.length; i++){
                var n: ITreeNode = <ITreeNode>yearNode.nodes[i];
                if (month === this.getNodeMonth(n)) return n;
            }

            return null;
        }

        public createDateNodes(rootNode: ITreeNode, nodes: ITreeNode[]): void{
            for (var i = 0; i < nodes.length; i++) {
                var node: ITreeNode = <ITreeNode>nodes[i];
                var year = this.getNodeYear(node);
                var month = this.getNodeMonth(node);

                var dateNode = manifesto.getTreeNode();
                dateNode.id = node.id;
                dateNode.label = this.getNodeDisplayDate(node);
                dateNode.data = node.data;
                dateNode.data.type = manifesto.TreeNodeType.manifest().toString();
                dateNode.data.year = year;
                dateNode.data.month = month;

                var decadeNode = this.getDecadeNode(rootNode, year);

                if (decadeNode) {
                    var yearNode = this.getYearNode(decadeNode, year);

                    if (yearNode){
                        var monthNode = this.getMonthNode(yearNode, month);

                        if (monthNode){
                            monthNode.addNode(dateNode);
                        }
                    }
                }
            }
        }

        public getNodeYear(node: ITreeNode): number{
            return node.navDate.getFullYear();
        }

        public getNodeMonth(node: ITreeNode): number{
            return node.navDate.getMonth();
        }

        public getNodeDisplayMonth(node: ITreeNode): string{
            var months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            return months[node.navDate.getMonth()];
        }

        public getNodeDisplayDate(node: ITreeNode): string{
            return node.navDate.toDateString();
        }
        
        public getMetadata(): Manifold.IMetadataItem[] {
            var result: Manifold.IMetadataItem[] = [];

            var metadata = this.manifest.getMetadata();

            if (metadata){
                result.push(<Manifold.IMetadataItem>{
                    label: "metadata",
                    value: metadata,
                    isRootLevel: true
                });
            }

            if (this.manifest.getDescription()){
                result.push(<Manifold.IMetadataItem>{
                    label: "description",
                    value: this.manifest.getDescription(),
                    isRootLevel: true
                });
            }

            if (this.manifest.getAttribution()){
                result.push(<Manifold.IMetadataItem>{
                    label: "attribution",
                    value: this.manifest.getAttribution(),
                    isRootLevel: true
                });
            }

            if (this.manifest.getLicense()){
                result.push(<Manifold.IMetadataItem>{
                    label: "license",
                    value: this._licenseFormatter.format(this.manifest.getLicense()),
                    isRootLevel: true
                });
            }

            if (this.manifest.getLogo()){
                result.push(<Manifold.IMetadataItem>{
                    label: "logo",
                    value: '<img src="' + this.manifest.getLogo() + '"/>',
                    isRootLevel: true
                });
            }

            return result;
        }
        
        public getCanvasMetadata(canvas: Manifesto.ICanvas): Manifold.IMetadataItem[] {
            var result: Manifold.IMetadataItem[] = [];

            var metadata = canvas.getMetadata();

            if (metadata){
                result.push(<Manifold.IMetadataItem>{
                    label: "metadata",
                    value: metadata,
                    isRootLevel: true
                });
            }

            return result;
        }
        
        public getCurrentElement(): Manifesto.IElement {
            return <Manifesto.IElement>this.getCanvasByIndex(this.canvasIndex);
        }

        public getResources(): Manifesto.IAnnotation[] {
            var element: Manifesto.IElement = this.getCurrentElement();
            return element.getResources();
        }

        public hasParentCollection(): boolean {
            return !!this.manifest.parentCollection;
        }

        public hasResources(): boolean {
            return this.getResources().length > 0;
        }
        
        public isContinuous(): boolean {
            return this.getViewingHint().toString() === manifesto.ViewingHint.continuous().toString();
        }

        public isPaged(): boolean {
            return this.getViewingHint().toString() === manifesto.ViewingHint.paged().toString();
        }

        public isBottomToTop(): boolean {
            return this.getViewingDirection().toString() === manifesto.ViewingDirection.bottomToTop().toString()
        }

        public isTopToBottom(): boolean {
            return this.getViewingDirection().toString() === manifesto.ViewingDirection.topToBottom().toString();
        }

        public isLeftToRight(): boolean {
            return this.getViewingDirection().toString() === manifesto.ViewingDirection.leftToRight().toString();
        }

        public isRightToLeft(): boolean {
            return this.getViewingDirection().toString() === manifesto.ViewingDirection.rightToLeft().toString();
        }

        public isHorizontallyAligned(): boolean {
            return this.isLeftToRight() || this.isRightToLeft()
        }

        public isVerticallyAligned(): boolean {
            return this.isTopToBottom() || this.isBottomToTop()
        }
        
        public isPagingAvailable(): boolean {
            // paged mode is useless unless you have at least 3 pages...
            return this.isPagingEnabled() && this.getTotalCanvases() > 2;
        }

        public isPagingEnabled(): boolean{
            return this.getCurrentSequence().isPagingEnabled();
        }
        
        public getAutoCompleteService(): Manifesto.IService {
            var service: Manifesto.IService = this.getSearchWithinService();
            if (!service) return null;
            return service.getService(manifesto.ServiceProfile.autoComplete());
        }
        
        public getSearchWithinService(): Manifesto.IService {
            return this.manifest.getService(manifesto.ServiceProfile.searchWithin());
        }
    }
    
}

(function(w) {
    if (!w.Manifold){
        w.Manifold = Manifold;
    }
})(window);