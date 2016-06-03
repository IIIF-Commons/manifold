// manifold v1.0.0 https://github.com/UniversalViewer/manifold#readme
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.manifold = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){








var Manifold;
(function (Manifold) {
    var IIIFHelper = (function () {
        function IIIFHelper(iiifResource) {
            this.iiifResource = iiifResource;
        }
        IIIFHelper.prototype.getTree = function () {
            return this.iiifResource.getTree();
        };
        // returns a list of treenodes for each decade.
        // expanding a decade generates a list of years
        // expanding a year gives a list of months containing issues
        // expanding a month gives a list of issues.
        IIIFHelper.prototype.getSortedTree = function (sortType) {
            var tree = this.iiifResource.getTree();
            var sortedTree = manifesto.getTreeNode();
            if (sortType === Manifold.TreeSortType.date) {
                this.getSortedTreeNodesByDate(sortedTree, tree);
            }
            else if (sortType === Manifold.TreeSortType.none) {
                sortedTree = tree;
            }
            return sortedTree;
        };
        IIIFHelper.prototype.getSortedTreeNodesByDate = function (sortedTree, tree) {
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
        IIIFHelper.prototype.createDecadeNodes = function (rootNode, nodes) {
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
        IIIFHelper.prototype.pruneDecadeNodes = function (rootNode) {
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
        IIIFHelper.prototype.sortDecadeNodes = function (rootNode) {
            rootNode.nodes = rootNode.nodes.sort(function (a, b) {
                return a.data.startYear - b.data.startYear;
            });
        };
        IIIFHelper.prototype.getDecadeNode = function (rootNode, year) {
            for (var i = 0; i < rootNode.nodes.length; i++) {
                var n = rootNode.nodes[i];
                if (year >= n.data.startYear && year <= n.data.endYear)
                    return n;
            }
            return null;
        };
        IIIFHelper.prototype.createYearNodes = function (rootNode, nodes) {
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
        IIIFHelper.prototype.sortYearNodes = function (rootNode) {
            var _this = this;
            for (var i = 0; i < rootNode.nodes.length; i++) {
                var decadeNode = rootNode.nodes[i];
                decadeNode.nodes = decadeNode.nodes.sort(function (a, b) {
                    return (_this.getNodeYear(a) - _this.getNodeYear(b));
                });
            }
        };
        IIIFHelper.prototype.getYearNode = function (decadeNode, year) {
            for (var i = 0; i < decadeNode.nodes.length; i++) {
                var n = decadeNode.nodes[i];
                if (year === this.getNodeYear(n))
                    return n;
            }
            return null;
        };
        IIIFHelper.prototype.createMonthNodes = function (rootNode, nodes) {
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
        IIIFHelper.prototype.sortMonthNodes = function (rootNode) {
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
        IIIFHelper.prototype.getMonthNode = function (yearNode, month) {
            for (var i = 0; i < yearNode.nodes.length; i++) {
                var n = yearNode.nodes[i];
                if (month === this.getNodeMonth(n))
                    return n;
            }
            return null;
        };
        IIIFHelper.prototype.createDateNodes = function (rootNode, nodes) {
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
        IIIFHelper.prototype.getNodeYear = function (node) {
            return node.navDate.getFullYear();
        };
        IIIFHelper.prototype.getNodeMonth = function (node) {
            return node.navDate.getMonth();
        };
        IIIFHelper.prototype.getNodeDisplayMonth = function (node) {
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            return months[node.navDate.getMonth()];
        };
        IIIFHelper.prototype.getNodeDisplayDate = function (node) {
            return node.navDate.toDateString();
        };
        return IIIFHelper;
    }());
    Manifold.IIIFHelper = IIIFHelper;
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

},{}]},{},[1])(1)
});