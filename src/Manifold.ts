namespace Manifold {
    
    export class IIIFHelper {
        
        public iiifResource: Manifesto.IIIIFResource;
        
        constructor(iiifResource: Manifesto.IIIIFResource){
            this.iiifResource = iiifResource;
        }
        
        public getTree(): Manifesto.ITreeNode{
            return this.iiifResource.getTree();
        }
        
        // returns a list of treenodes for each decade.
        // expanding a decade generates a list of years
        // expanding a year gives a list of months containing issues
        // expanding a month gives a list of issues.
        public getSortedTree(sortType: TreeSortType): ITreeNode {

            var tree: ITreeNode = <ITreeNode>this.iiifResource.getTree();
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
    }
    
}

(function(w) {
    if (!w.Manifold){
        w.Manifold = Manifold;
    }
})(window);