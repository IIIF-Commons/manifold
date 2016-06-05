namespace Manifold {

    export class MultiSelectState {
        enabled: boolean = false;
        ranges: IRange[] = [];
        canvases: ICanvas[] = [];
        
        public allCanvasesSelected(): boolean {
            return this.canvases.length > 0 && this.getAllSelectedCanvases().length === this.canvases.length;
        }
        
        public allRangesSelected(): boolean {
            return this.ranges.length > 0 && this.getAllSelectedRanges().length === this.ranges.length;
        }
        
        public allSelected(): boolean {
            return this.allRangesSelected() && this.allCanvasesSelected();
        }
        
        public getAll(): IMultiSelectable[] {
            return (<IMultiSelectable[]>this.canvases).concat(<IMultiSelectable[]>this.ranges);
        }
        
        public getAllSelectedCanvases(): ICanvas[] {
            return this.canvases.en().where(c => c.multiSelected).toArray();
        }

        public getAllSelectedRanges(): IRange[] {
            return this.ranges.en().where(r => r.multiSelected).toArray();
        }

        public getCanvasById(id: string): ICanvas {
            return this.canvases.en().where(c => c.id === id).first();
        }
        
        public getCanvasesByIds(ids: string[]): ICanvas[] {
            var canvases: ICanvas[] = [];

            for (var i = 0; i < ids.length; i++) {
                var id: string = ids[i];
                canvases.push(this.getCanvasById(id));
            }

            return canvases;
        }
        
        public getRangeCanvases(range: Manifesto.IRange): Manifesto.ICanvas[] {
            var ids: string[] = range.getCanvasIds();
            return this.getCanvasesByIds(ids);
        }
        
        public selectAll(selected: boolean): void {
            this.selectRanges(this.ranges, selected);
            this.selectCanvases(this.canvases, selected);
        }

        public selectCanvas(canvas: ICanvas, selected: boolean): void {
            var c: ICanvas = this.canvases.en().where(c => c.id === canvas.id).first();
            c.multiSelected = selected;
        }
        
        public selectAllCanvases(selected: boolean): void {
            this.selectCanvases(this.canvases, selected);
        }
        
        public selectCanvases(canvases: ICanvas[], selected: boolean): void {
            for(var j = 0; j < canvases.length; j++) {
                var canvas: ICanvas = canvases[j];
                canvas.multiSelected = selected;
            }
        }
        
        public selectRange(range: IRange, selected: boolean): void {
            var r: IRange = this.ranges.en().where(r => r.id === range.id).first();
            r.multiSelected = selected;

            var canvases: ICanvas[] = <ICanvas[]>this.getRangeCanvases(r);

            this.selectCanvases(canvases, selected);
        }
        
        public selectAllRanges(selected: boolean): void {
            this.selectRanges(this.ranges, selected);
        }
        
        public selectRanges(ranges: IRange[], selected: boolean): void {
            for(var i = 0; i < ranges.length; i++) {
                var range: IRange = ranges[i];
                range.multiSelected = selected;
                var canvases: ICanvas[] = this.getCanvasesByIds(range.getCanvasIds());
                this.selectCanvases(canvases, selected);
            }
        }
        
        public setEnabled(enabled: boolean): void {
            this.enabled = enabled;
            
            var items: IMultiSelectable[] = this.getAll();

            for (var i = 0; i < items.length; i++){
                var item: IMultiSelectable = items[i];
                item.multiSelectEnabled = this.enabled;
            }
        }
    }

}