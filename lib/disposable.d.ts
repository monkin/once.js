import { El } from "./el";
/**
 * Bind release resources function to the element
 * Dispose function will be called on component remove
 */
export declare function disposable(el: El, dispose: () => void): El;
