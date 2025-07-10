export class AnnotationPoint3D {
  public canvasId: string;
  public canvasIndex: number;
  public bodyValue: string;
  public index: number;
  public isVisible: boolean = true;
  public x: number;
  public y: number;
  public z: number;
  public nx: number;
  public ny: number;
  public nz: number;

  constructor(anno: any) {
    const xyz = anno.target.match(
      /.*[^n]xyz=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/
    );
    const nxyz = anno.target.match(
      /.*nxyz=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/
    );
    this.bodyValue = anno.bodyValue;
    this.x = Number(xyz[1]);
    this.y = Number(xyz[2]);
    this.z = Number(xyz[3]);
    this.nx = Number(nxyz[1]);
    this.ny = Number(nxyz[2]);
    this.nz = Number(nxyz[3]);
  }
}
