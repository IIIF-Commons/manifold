namespace Manifold {
    export class MetadataGroupType extends StringValue{
        public static MANIFEST = new MetadataGroupType("manifest");
        public static SEQUENCE = new MetadataGroupType("sequence");
        public static RANGE = new MetadataGroupType("range");
        public static CANVAS = new MetadataGroupType("canvas");
        public static IMAGE = new MetadataGroupType("image");
    }
}