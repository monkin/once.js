import { El } from "./el";
import { when } from "./when";
import { none } from "./none";
import { Param } from "./param";

/**
 * Conditionaly renders compoent
 */
export function optional(flag: Param<boolean>, child: () => El) {
    return when(flag, child, none);
}