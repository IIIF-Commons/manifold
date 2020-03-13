import { AnnotationRect } from "./AnnotationRect";

export class AnnotationGroup {
  public canvasIndex: number;
  public rects: AnnotationRect[] = [];

  constructor(resource: any, canvasIndex: number) {
    this.canvasIndex = canvasIndex;
    this.addRect(resource);
  }

  addRect(resource: any): void {
    const rect: AnnotationRect = new AnnotationRect(resource);
    rect.canvasIndex = this.canvasIndex;
    rect.index = this.rects.length;
    this.rects.push(rect);
    // sort ascending
    this.rects.sort((a, b) => {
      return a.index - b.index;
    });
  }
}
