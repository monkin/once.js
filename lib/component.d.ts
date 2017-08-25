import { El } from "./el";
/**
 * Allow component get properties as a function or objects
 */
export declare function component<T extends Object>(factory: (props: () => T) => El): (props: T | (() => T)) => El;
