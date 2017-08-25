import { El } from "./el";
/**
 * @param initial Initial state value
 * @param render Callback with parameters that helps to get and set state
 */
export declare function state<T>(initial: T, render: (get: () => T, set: (v: T | ((s: T) => T)) => void) => El): El;
