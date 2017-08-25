import { El } from "./el";
/**
 * Conditionaly renders compoent
 */
export declare function optional(flag: () => boolean, child: () => El): El;
