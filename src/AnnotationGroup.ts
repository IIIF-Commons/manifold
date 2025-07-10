import { AnnotationPoint3D } from "./AnnotationPoint3D";
import { AnnotationRect } from "./AnnotationRect";

export class AnnotationGroup {
  public canvasId: string;
  public canvasIndex: number;
  public rects: AnnotationRect[] = [];
  public points3D: AnnotationPoint3D[] = [];

  constructor(canvasId: string) {
    this.canvasId = canvasId;
  }

  addRect(anno: any): void {
    const rect: AnnotationRect = new AnnotationRect(anno);
    rect.canvasId = this.canvasId;
    rect.canvasIndex = this.canvasIndex;
    rect.index = this.rects.length;
    this.rects.push(rect);
    // sort ascending
    this.rects.sort((a, b) => {
      return a.index - b.index;
    });
  }

  addPoint3D(anno: any): void {
    const point: AnnotationPoint3D = new AnnotationPoint3D(anno);
    point.canvasId = this.canvasId;
    point.canvasIndex = this.canvasIndex;
    point.index = this.points3D.length;
    this.points3D.push(point);
    // sort ascending
    this.points3D.sort((a, b) => {
      return a.index - b.index;
    });
  }
}
