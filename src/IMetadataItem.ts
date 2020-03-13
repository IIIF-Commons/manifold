import { LabelValuePair } from "manifesto.js";

export interface IMetadataItem extends LabelValuePair {
  isRootLevel: boolean;
}
