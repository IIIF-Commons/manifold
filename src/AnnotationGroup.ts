import { AnnotationRect } from "./AnnotationRect";

export class AnnotationGroup {
  public canvasId: string;
  /** @deprecated */
  public canvasIndex: number;
  public rects: AnnotationRect[] = [];

  constructor(canvasId: string) {
    this.canvasId = canvasId;
  }

  addRect(resource: any): void {
    const rect: AnnotationRect = new AnnotationRect(resource);
    rect.canvasId = this.canvasId;
    /** @deprecated */
    rect.canvasIndex = this.canvasIndex;
    rect.index = this.rects.length;
    this.rects.push(rect);
    // sort ascending
    this.rects.sort((a, b) => {
      return a.index - b.index;
    });
  }
}
