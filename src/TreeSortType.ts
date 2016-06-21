namespace Manifold {
    export class TreeSortType extends StringValue{
        public static DATE = new TreeSortType("date");
        public static NONE = new TreeSortType("none");

        // todo: use getters when ES3 target is no longer required.

        date(): TreeSortType {
            return new TreeSortType(TreeSortType.DATE.toString());
        }

        none(): TreeSortType {
            return new TreeSortType(TreeSortType.NONE.toString());
        }
    }
}