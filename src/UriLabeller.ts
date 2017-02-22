namespace Manifold {
    // This class formats URIs into HTML <a> links, applying labels when available
    export class UriLabeller {
        labels: any;

        constructor(labels: Object) {
            this.labels = labels;
        }

        format(url: string): string {
            // if already a link, do nothing.
            if (url.indexOf('<a') != -1) return url;

            const label: string = (this.labels[url]) ? this.labels[url] : url;
            return '<a href="' + url + '">' + label + '</a>';
        }
    }
}