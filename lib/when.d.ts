import { El } from "./el";
/**
 * Renders one of two components
 * @param flag Predicat to decide which component should be rendered
 */
export declare function when(flag: () => boolean, whenTrue: () => El, whenFalse: () => El): El;
