import { IMultiSelectable } from "./IMultiSelectable";
import { Thumb } from "manifesto.js";

export interface MultiSelectableThumb extends IMultiSelectable, Thumb {
  initialWidth: number;
  initialHeight: number;
}
