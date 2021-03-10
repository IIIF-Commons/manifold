export * from "./AnnotationGroup";
export * from "./AnnotationRect";
export * from "./Bootstrapper";
export * from "./ExternalResource";
export * from "./Helper";
export * from "./ILabelValuePair";
export * from "./IManifoldOptions";
export * from "./IMultiSelectable";
export * from "./IThumb";
export * from "./MetadataGroup";
export * from "./MetadataOptions";
export * from "./MultiSelectableCanvas";
export * from "./MultiSelectableRange";
export * from "./MultiSelectableTreeNode";
export * from "./MultiSelectState";
export * from "./Translation";
export * from "./TreeSortType";
export * from "./UriLabeller";

import { IManifoldOptions } from "./IManifoldOptions";
import { Bootstrapper } from "./Bootstrapper";
import { Helper } from "./Helper";

export const loadManifest: (options: IManifoldOptions) => Promise<Helper> = (
  options: IManifoldOptions
) => {
  return new Bootstrapper(options).bootstrap();
};

export const loadManifestJson: (json: any, options: IManifoldOptions) => Promise<Helper> = (
  json,
  options
) => {
  return new Bootstrapper(options).bootstrapJson(json);
};
