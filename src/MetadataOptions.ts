import { UriLabeller } from "./UriLabeller";
import { Canvas, Range } from "manifesto.js";

export class MetadataOptions {
    canvases: Canvas[];
    licenseFormatter: UriLabeller;
    range: Range;
} 