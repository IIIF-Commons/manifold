export class AnnotationRect {
  public canvasId: string;
  public canvasIndex: number;
  public chars: string;
  public height: number;
  public index: number;
  public isVisible: boolean = true;
  public viewportX: number;
  public viewportY: number;
  public width: number;
  public x: number;
  public y: number;

  constructor(anno: any) {
    let xywh: any;
    // todo: use this?
    // /[#&?](xywh=)?(pixel:|percent:)?([0-9]+(?:\.[0-9]+)?),([0-9]+(?:\.[0-9]+)?),([0-9]+(?:\.[0-9]+)?),([0-9]+(?:\.[0-9]+)?)/
    if (anno.on) {
      // open annotations
      xywh = anno.on.match(/.*xywh=(\d*),(\d*),(\d*),(\d*)/);
      this.chars = anno.resource.chars;
    } else {
      // web annotations
      xywh = anno.target.match(/.*xywh=(\d*),(\d*),(\d*),(\d*)/);
      this.chars = anno.bodyValue;
    }
    this.x = Number(xywh[1]);
    this.y = Number(xywh[2]);
    this.width = Number(xywh[3]);
    this.height = Number(xywh[4]);
  }
}
