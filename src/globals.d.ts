import * as M from "manifesto.js";

declare global {
    interface Window {
        manifestCallback: any;
    }

    interface JQueryXHR {
        setRequestHeader: (name: string, value: string) => void;
    }
    
    declare function escape(s:string): string;
    declare function unescape(s:string): string;
    
    const manifesto: M
}
export {};