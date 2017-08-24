import { El } from "./el";
export declare function component<T extends Object>(factory: (props: () => T) => El): (props: T | (() => T)) => El;
