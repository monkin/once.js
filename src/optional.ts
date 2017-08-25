import { El } from "./el";
import { when } from "./when";
import { none } from "./none";

/**
 * Conditionaly renders compoent
 */
export function optional(flag: () => boolean, child: () => El) {
    return when(flag, child, none);
}