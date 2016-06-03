// manifold v1.0.0 https://github.com/UniversalViewer/manifold#readme
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.manifold = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){












var Manifold;
(function (Manifold) {
    var ManifestHelper = (function () {
        function ManifestHelper(options) {
            this.manifest = options.manifest;
            this._licenseFormatter = new Manifold.UriLabeller(options.licenseMap || {});
            this.canvasIndex = options.canvasIndex || 0;
            this.sequenceIndex = options.sequenceIndex || 0;
        }
        ManifestHelper.prototype.getAttribution = function () {
            return this.manifest.getAttribution();
        };
        ManifestHelper.prototype.getCanvases = function () {
            return this.getCurrentSequence().getCanvases();
        };
        ManifestHelper.prototype.getCanvasById = function (id) {
            return this.getCurrentSequence().getCanvasById(id);
        };
        ManifestHelper.prototype.getCanvasesById = function (ids) {
            var canvases = [];
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                canvases.push(this.getCanvasById(id));
            }
            return canvases;
        };
        ManifestHelper.prototype.getCanvasByIndex = function (index) {
            return this.getCurrentSequence().getCanvasByIndex(index);
        };
        ManifestHelper.prototype.getCanvasRange = function (canvas) {
            // get ranges that contain the canvas id. return the last.
            return this.getCanvasRanges(canvas).last();
        };
        ManifestHelper.prototype.getCanvasRanges = function (canvas) {
            if (canvas.ranges) {
                return canvas.ranges;
            }
            else {
                canvas.ranges = this.manifest.getRanges().en().where(function (range) { return (range.getCanvasIds().en().any(function (c) { return c === canvas.id; })); }).toArray();
            }
            return canvas.ranges;
        };
        ManifestHelper.prototype.getCurrentCanvas = function () {
            return this.getCurrentSequence().getCanvasByIndex(this.canvasIndex);
        };
        ManifestHelper.prototype.getCurrentSequence = function () {
            return this.getSequenceByIndex(this.sequenceIndex);
        };
        ManifestHelper.prototype.getCollectionIndex = function (iiifResource) {
            // todo: support nested collections. walk up parents adding to array and return csv string.
            var index;
            if (iiifResource.parentCollection) {
                index = iiifResource.parentCollection.index;
            }
            return index;
        };
        ManifestHelper.prototype.getElementType = function (element) {
            if (!element) {
                element = this.getCurrentCanvas();
            }
            return element.getType();
        };
        ManifestHelper.prototype.getLabel = function () {
            return this.manifest.getLabel();
        };
        ManifestHelper.prototype.getLastCanvasLabel = function (alphanumeric) {
            return this.getCurrentSequence().getLastCanvasLabel(alphanumeric);
        };
        ManifestHelper.prototype.getLicense = function () {
            return this.manifest.getLicense();
        };
        ManifestHelper.prototype.getLogo = function () {
            return this.manifest.getLogo();
        };
        ManifestHelper.prototype.getManifestType = function () {
            var manifestType = this.manifest.getManifestType();
            // default to monograph
            if (manifestType.toString() === "") {
                manifestType = manifesto.ManifestType.monograph();
            }
            return manifestType;
        };
        ManifestHelper.prototype.getSeeAlso = function () {
            return this.manifest.getSeeAlso();
        };
        ManifestHelper.prototype.getSequenceByIndex = function (index) {
            return this.manifest.getSequenceByIndex(index);
        };
        ManifestHelper.prototype.isCanvasIndexOutOfRange = function (index) {
            return this.getCurrentSequence().isCanvasIndexOutOfRange(index);
        };
        ManifestHelper.prototype.isFirstCanvas = function (index) {
            return this.getCurrentSequence().isFirstCanvas(index);
        };
        ManifestHelper.prototype.isLastCanvas = function (index) {
            return this.getCurrentSequence().isLastCanvas(index);
        };
        ManifestHelper.prototype.isMultiSequence = function () {
            return this.manifest.isMultiSequence();
        };
        ManifestHelper.prototype.isTotalCanvasesEven = function () {
            return this.getCurrentSequence().isTotalCanvasesEven();
        };
        ManifestHelper.prototype.getRangeCanvases = function (range) {
            var ids = range.getCanvasIds();
            return this.getCanvasesById(ids);
        };
        ManifestHelper.prototype.getTotalCanvases = function () {
            return this.getCurrentSequence().getTotalCanvases();
        };
        ManifestHelper.prototype.isMultiCanvas = function () {
            return this.getCurrentSequence().isMultiCanvas();
        };
        ManifestHelper.prototype.isUIEnabled = function (name) {
            var uiExtensions = this.manifest.getService(manifesto.ServiceProfile.uiExtensions());
            if (uiExtensions) {
                var disableUI = uiExtensions.getProperty('disableUI');
                if (disableUI) {
                    if (disableUI.contains(name) || disableUI.contains(name.toLowerCase())) {
                        return false;
                    }
                }
            }
            return true;
        };
        ManifestHelper.prototype.getInfoUri = function (canvas) {
            // default to IxIF
            var service = canvas.getService(manifesto.ServiceProfile.ixif());
            if (service) {
                return service.getInfoUri();
            }
            // return the canvas id.
            return canvas.id;
        };
        ManifestHelper.prototype.getPagedIndices = function (canvasIndex) {
            if (typeof (canvasIndex) === 'undefined')
                canvasIndex = this.canvasIndex;
            return [canvasIndex];
        };
        ManifestHelper.prototype.getViewingDirection = function () {
            var viewingDirection = this.getCurrentSequence().getViewingDirection();
            if (!viewingDirection.toString()) {
                viewingDirection = this.manifest.getViewingDirection();
            }
            return viewingDirection;
        };
        ManifestHelper.prototype.getViewingHint = function () {
            var viewingHint = this.getCurrentSequence().getViewingHint();
            if (!viewingHint.toString()) {
                viewingHint = this.manifest.getViewingHint();
            }
            return viewingHint;
        };
        ManifestHelper.prototype.getFirstPageIndex = function () {
            return 0;
        };
        ManifestHelper.prototype.getLastPageIndex = function () {
            return this.getTotalCanvases() - 1;
        };
        ManifestHelper.prototype.getStartCanvasIndex = function () {
            return this.getCurrentSequence().getStartCanvasIndex();
        };
        ManifestHelper.prototype.getThumbs = function (width, height) {
            return this.getCurrentSequence().getThumbs(width, height);
        };
        ManifestHelper.prototype.getRangeByPath = function (path) {
            return this.manifest.getRangeByPath(path);
        };
        ManifestHelper.prototype.getCanvasIndexById = function (id) {
            return this.getCurrentSequence().getCanvasIndexById(id);
        };
        ManifestHelper.prototype.getCanvasIndexByLabel = function (label) {
            var foliated = this.getManifestType().toString() === manifesto.ManifestType.manuscript().toString();
            return this.getCurrentSequence().getCanvasIndexByLabel(label, foliated);
        };
        ManifestHelper.prototype.getRanges = function () {
            return this.manifest.getRanges();
        };
        ManifestHelper.prototype.getTree = function () {
            return this.manifest.getTree();
        };
        // returns a list of treenodes for each decade.
        // expanding a decade generates a list of years
        // expanding a year gives a list of months containing issues
        // expanding a month gives a list of issues.
        ManifestHelper.prototype.getSortedTree = function (sortType) {
            var tree = this.manifest.getTree();
            var sortedTree = manifesto.getTreeNode();
            if (sortType === Manifold.TreeSortType.date) {
                this.getSortedTreeNodesByDate(sortedTree, tree);
            }
            else if (sortType === Manifold.TreeSortType.none) {
                sortedTree = tree;
            }
            return sortedTree;
        };
        ManifestHelper.prototype.getSortedTreeNodesByDate = function (sortedTree, tree) {
            var all = tree.nodes.en().traverseUnique(function (node) { return node.nodes; })
                .where(function (n) { return n.data.type === manifesto.TreeNodeType.collection().toString() ||
                n.data.type === manifesto.TreeNodeType.manifest().toString(); }).toArray();
            //var collections: ITreeNode[] = tree.nodes.en().traverseUnique(n => n.nodes)
            //    .where((n) => n.data.type === ITreeNodeType.collection().toString()).toArray();
            var manifests = tree.nodes.en().traverseUnique(function (n) { return n.nodes; })
                .where(function (n) { return n.data.type === manifesto.TreeNodeType.manifest().toString(); }).toArray();
            this.createDecadeNodes(sortedTree, all);
            this.sortDecadeNodes(sortedTree);
            this.createYearNodes(sortedTree, all);
            this.sortYearNodes(sortedTree);
            this.createMonthNodes(sortedTree, manifests);
            this.sortMonthNodes(sortedTree);
            this.createDateNodes(sortedTree, manifests);
            this.pruneDecadeNodes(sortedTree);
        };
        ManifestHelper.prototype.createDecadeNodes = function (rootNode, nodes) {
            var decadeNode;
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                var year = this.getNodeYear(node);
                var decade = Number(year.toString().substr(2, 1));
                var endYear = Number(year.toString().substr(0, 3) + "9");
                if (!this.getDecadeNode(rootNode, year)) {
                    decadeNode = manifesto.getTreeNode();
                    decadeNode.label = year + " - " + endYear;
                    decadeNode.navDate = node.navDate;
                    decadeNode.data.startYear = year;
                    decadeNode.data.endYear = endYear;
                    rootNode.addNode(decadeNode);
                }
            }
        };
        // delete any empty decades
        ManifestHelper.prototype.pruneDecadeNodes = function (rootNode) {
            var pruned = [];
            for (var i = 0; i < rootNode.nodes.length; i++) {
                var n = rootNode.nodes[i];
                if (!n.nodes.length) {
                    pruned.push(n);
                }
            }
            for (var j = 0; j < pruned.length; j++) {
                var p = pruned[j];
                rootNode.nodes.remove(p);
            }
        };
        ManifestHelper.prototype.sortDecadeNodes = function (rootNode) {
            rootNode.nodes = rootNode.nodes.sort(function (a, b) {
                return a.data.startYear - b.data.startYear;
            });
        };
        ManifestHelper.prototype.getDecadeNode = function (rootNode, year) {
            for (var i = 0; i < rootNode.nodes.length; i++) {
                var n = rootNode.nodes[i];
                if (year >= n.data.startYear && year <= n.data.endYear)
                    return n;
            }
            return null;
        };
        ManifestHelper.prototype.createYearNodes = function (rootNode, nodes) {
            var yearNode;
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                var year = this.getNodeYear(node);
                var decadeNode = this.getDecadeNode(rootNode, year);
                if (decadeNode && !this.getYearNode(decadeNode, year)) {
                    yearNode = manifesto.getTreeNode();
                    yearNode.label = year.toString();
                    yearNode.navDate = node.navDate;
                    yearNode.data.year = year;
                    decadeNode.addNode(yearNode);
                }
            }
        };
        ManifestHelper.prototype.sortYearNodes = function (rootNode) {
            var _this = this;
            for (var i = 0; i < rootNode.nodes.length; i++) {
                var decadeNode = rootNode.nodes[i];
                decadeNode.nodes = decadeNode.nodes.sort(function (a, b) {
                    return (_this.getNodeYear(a) - _this.getNodeYear(b));
                });
            }
        };
        ManifestHelper.prototype.getYearNode = function (decadeNode, year) {
            for (var i = 0; i < decadeNode.nodes.length; i++) {
                var n = decadeNode.nodes[i];
                if (year === this.getNodeYear(n))
                    return n;
            }
            return null;
        };
        ManifestHelper.prototype.createMonthNodes = function (rootNode, nodes) {
            var monthNode;
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                var year = this.getNodeYear(node);
                var month = this.getNodeMonth(node);
                var decadeNode = this.getDecadeNode(rootNode, year);
                var yearNode = this.getYearNode(decadeNode, year);
                if (decadeNode && yearNode && !this.getMonthNode(yearNode, month)) {
                    monthNode = manifesto.getTreeNode();
                    monthNode.label = this.getNodeDisplayMonth(node);
                    monthNode.navDate = node.navDate;
                    monthNode.data.year = year;
                    monthNode.data.month = month;
                    yearNode.addNode(monthNode);
                }
            }
        };
        ManifestHelper.prototype.sortMonthNodes = function (rootNode) {
            var _this = this;
            for (var i = 0; i < rootNode.nodes.length; i++) {
                var decadeNode = rootNode.nodes[i];
                for (var j = 0; j < decadeNode.nodes.length; j++) {
                    var monthNode = decadeNode.nodes[j];
                    monthNode.nodes = monthNode.nodes.sort(function (a, b) {
                        return _this.getNodeMonth(a) - _this.getNodeMonth(b);
                    });
                }
            }
        };
        ManifestHelper.prototype.getMonthNode = function (yearNode, month) {
            for (var i = 0; i < yearNode.nodes.length; i++) {
                var n = yearNode.nodes[i];
                if (month === this.getNodeMonth(n))
                    return n;
            }
            return null;
        };
        ManifestHelper.prototype.createDateNodes = function (rootNode, nodes) {
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
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
                    if (yearNode) {
                        var monthNode = this.getMonthNode(yearNode, month);
                        if (monthNode) {
                            monthNode.addNode(dateNode);
                        }
                    }
                }
            }
        };
        ManifestHelper.prototype.getNodeYear = function (node) {
            return node.navDate.getFullYear();
        };
        ManifestHelper.prototype.getNodeMonth = function (node) {
            return node.navDate.getMonth();
        };
        ManifestHelper.prototype.getNodeDisplayMonth = function (node) {
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            return months[node.navDate.getMonth()];
        };
        ManifestHelper.prototype.getNodeDisplayDate = function (node) {
            return node.navDate.toDateString();
        };
        ManifestHelper.prototype.getMetadata = function () {
            var result = [];
            var metadata = this.manifest.getMetadata();
            if (metadata) {
                result.push({
                    label: "metadata",
                    value: metadata,
                    isRootLevel: true
                });
            }
            if (this.manifest.getDescription()) {
                result.push({
                    label: "description",
                    value: this.manifest.getDescription(),
                    isRootLevel: true
                });
            }
            if (this.manifest.getAttribution()) {
                result.push({
                    label: "attribution",
                    value: this.manifest.getAttribution(),
                    isRootLevel: true
                });
            }
            if (this.manifest.getLicense()) {
                result.push({
                    label: "license",
                    value: this._licenseFormatter.format(this.manifest.getLicense()),
                    isRootLevel: true
                });
            }
            if (this.manifest.getLogo()) {
                result.push({
                    label: "logo",
                    value: '<img src="' + this.manifest.getLogo() + '"/>',
                    isRootLevel: true
                });
            }
            return result;
        };
        ManifestHelper.prototype.getCanvasMetadata = function (canvas) {
            var result = [];
            var metadata = canvas.getMetadata();
            if (metadata) {
                result.push({
                    label: "metadata",
                    value: metadata,
                    isRootLevel: true
                });
            }
            return result;
        };
        ManifestHelper.prototype.getCurrentElement = function () {
            return this.getCanvasByIndex(this.canvasIndex);
        };
        ManifestHelper.prototype.getResources = function () {
            var element = this.getCurrentElement();
            return element.getResources();
        };
        ManifestHelper.prototype.hasParentCollection = function () {
            return !!this.manifest.parentCollection;
        };
        ManifestHelper.prototype.hasResources = function () {
            return this.getResources().length > 0;
        };
        ManifestHelper.prototype.isContinuous = function () {
            return this.getViewingHint().toString() === manifesto.ViewingHint.continuous().toString();
        };
        ManifestHelper.prototype.isPaged = function () {
            return this.getViewingHint().toString() === manifesto.ViewingHint.paged().toString();
        };
        ManifestHelper.prototype.isBottomToTop = function () {
            return this.getViewingDirection().toString() === manifesto.ViewingDirection.bottomToTop().toString();
        };
        ManifestHelper.prototype.isTopToBottom = function () {
            return this.getViewingDirection().toString() === manifesto.ViewingDirection.topToBottom().toString();
        };
        ManifestHelper.prototype.isLeftToRight = function () {
            return this.getViewingDirection().toString() === manifesto.ViewingDirection.leftToRight().toString();
        };
        ManifestHelper.prototype.isRightToLeft = function () {
            return this.getViewingDirection().toString() === manifesto.ViewingDirection.rightToLeft().toString();
        };
        ManifestHelper.prototype.isHorizontallyAligned = function () {
            return this.isLeftToRight() || this.isRightToLeft();
        };
        ManifestHelper.prototype.isVerticallyAligned = function () {
            return this.isTopToBottom() || this.isBottomToTop();
        };
        ManifestHelper.prototype.isPagingAvailable = function () {
            // paged mode is useless unless you have at least 3 pages...
            return this.isPagingEnabled() && this.getTotalCanvases() > 2;
        };
        ManifestHelper.prototype.isPagingEnabled = function () {
            return this.getCurrentSequence().isPagingEnabled();
        };
        ManifestHelper.prototype.getAutoCompleteService = function () {
            var service = this.getSearchWithinService();
            if (!service)
                return null;
            return service.getService(manifesto.ServiceProfile.autoComplete());
        };
        ManifestHelper.prototype.getSearchWithinService = function () {
            return this.manifest.getService(manifesto.ServiceProfile.searchWithin());
        };
        return ManifestHelper;
    }());
    Manifold.ManifestHelper = ManifestHelper;
})(Manifold || (Manifold = {}));
(function (w) {
    if (!w.Manifold) {
        w.Manifold = Manifold;
    }
})(window);

var Manifold;
(function (Manifold) {
    var MultiSelectState = (function () {
        function MultiSelectState() {
            this.enabled = false;
            this.ranges = [];
            this.canvases = [];
        }
        return MultiSelectState;
    }());
    Manifold.MultiSelectState = MultiSelectState;
})(Manifold || (Manifold = {}));

var Manifold;
(function (Manifold) {
    (function (TreeSortType) {
        TreeSortType[TreeSortType["date"] = 0] = "date";
        TreeSortType[TreeSortType["none"] = 1] = "none";
    })(Manifold.TreeSortType || (Manifold.TreeSortType = {}));
    var TreeSortType = Manifold.TreeSortType;
})(Manifold || (Manifold = {}));

var Manifold;
(function (Manifold) {
    // This class formats URIs into HTML <a> links, applying labels when available
    var UriLabeller = (function () {
        function UriLabeller(labels) {
            this.labels = labels;
        }
        UriLabeller.prototype.format = function (url) {
            // if already a link, do nothing.
            if (url.indexOf('<a') != -1)
                return url;
            var label = this.labels[url] ? this.labels[url] : url;
            return '<a href="' + url + '">' + label + '</a>';
        };
        return UriLabeller;
    }());
    Manifold.UriLabeller = UriLabeller;
})(Manifold || (Manifold = {}));

},{}]},{},[1])(1)
});