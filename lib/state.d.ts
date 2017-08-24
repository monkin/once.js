import { El } from "./el";
export declare function state<T>(initial: T, render: (get: () => T, set: (v: T | ((s: T) => T)) => void) => El): El;
