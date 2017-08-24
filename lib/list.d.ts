import { El } from "./el";
/**
 * List of elements. List of lists won't work.
 */
export declare function list<T>(data: T[] | (() => T[]), map: (item: () => T, index: () => number, list: () => T[]) => El, optionalKey?: (v: T, i: number) => any): El;
