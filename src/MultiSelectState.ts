import { MultiSelectableRange } from "./MultiSelectableRange";
import { MultiSelectableCanvas } from "./MultiSelectableCanvas";
import { IMultiSelectable } from "./IMultiSelectable";
import { Utils } from "manifesto.js";

export class MultiSelectState {
  isEnabled: boolean = false;
  ranges: MultiSelectableRange[] = [];
  canvases: MultiSelectableCanvas[] = [];

  public allCanvasesSelected(): boolean {
    return (
      this.canvases.length > 0 &&
      this.getAllSelectedCanvases().length === this.canvases.length
    );
  }

  public allRangesSelected(): boolean {
    return (
      this.ranges.length > 0 &&
      this.getAllSelectedRanges().length === this.ranges.length
    );
  }

  public allSelected(): boolean {
    return this.allRangesSelected() && this.allCanvasesSelected();
  }

  public getAll(): IMultiSelectable[] {
    return (<IMultiSelectable[]>this.canvases).concat(
      <IMultiSelectable[]>this.ranges
    );
  }

  public getAllSelectedCanvases(): MultiSelectableCanvas[] {
    return this.canvases.filter((c) => c.multiSelected);
  }

  public getAllSelectedRanges(): MultiSelectableRange[] {
    return this.ranges.filter((r) => r.multiSelected);
  }

  public getCanvasById(id: string): MultiSelectableCanvas {
    return this.canvases.filter(
      (c) => Utils.normaliseUrl(c.id) === Utils.normaliseUrl(id)
    )[0];
  }

  public getCanvasesByIds(ids: string[]): MultiSelectableCanvas[] {
    const canvases: MultiSelectableCanvas[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id: string = ids[i];
      canvases.push(this.getCanvasById(id));
    }

    return canvases;
  }

  public getRangeCanvases(
    range: MultiSelectableRange
  ): MultiSelectableCanvas[] {
    const ids: string[] = range.getCanvasIds();
    return this.getCanvasesByIds(ids);
  }

  public selectAll(selected: boolean): void {
    this.selectRanges(this.ranges, selected);
    this.selectCanvases(this.canvases, selected);
  }

  public selectCanvas(canvas: MultiSelectableCanvas, selected: boolean): void {
    const c: MultiSelectableCanvas = this.canvases.filter(
      (c) => c.id === canvas.id
    )[0];
    c.multiSelected = selected;
  }

  public selectAllCanvases(selected: boolean): void {
    this.selectCanvases(this.canvases, selected);
  }

  public selectCanvases(
    canvases: MultiSelectableCanvas[],
    selected: boolean
  ): void {
    for (let j = 0; j < canvases.length; j++) {
      const canvas: MultiSelectableCanvas = canvases[j];
      canvas.multiSelected = selected;
    }
  }

  public selectRange(range: MultiSelectableRange, selected: boolean): void {
    const r: MultiSelectableRange = this.ranges.filter(
      (r) => r.id === range.id
    )[0];
    r.multiSelected = selected;
    const canvases: MultiSelectableCanvas[] = <MultiSelectableCanvas[]>(
      this.getRangeCanvases(r)
    );
    this.selectCanvases(canvases, selected);
  }

  public selectAllRanges(selected: boolean): void {
    this.selectRanges(this.ranges, selected);
  }

  public selectRanges(ranges: MultiSelectableRange[], selected: boolean): void {
    for (let i = 0; i < ranges.length; i++) {
      const range: MultiSelectableRange = ranges[i];
      range.multiSelected = selected;
      const canvases: MultiSelectableCanvas[] = this.getCanvasesByIds(
        range.getCanvasIds()
      );
      this.selectCanvases(canvases, selected);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    const items: IMultiSelectable[] = this.getAll();

    for (let i = 0; i < items.length; i++) {
      const item: IMultiSelectable = items[i];
      item.multiSelectEnabled = this.isEnabled;
      if (!enabled) {
        item.multiSelected = false;
      }
    }
  }
}
