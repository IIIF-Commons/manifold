import { IMultiSelectable } from "./IMultiSelectable";

export interface MultiSelectableThumb extends IMultiSelectable, manifesto.Thumb {
    initialWidth: number;
    initialHeight: number;
}