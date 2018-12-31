import { Canvas, Range } from "manifesto.js";
import { UriLabeller } from "./UriLabeller";

export class MetadataOptions {
    canvases: Canvas[];
    licenseFormatter: UriLabeller;
    range: Range;
} 