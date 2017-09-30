import { El, Children } from "./el";
import { when } from "./when";
import { none } from "./none";
import { Param } from "./param";

/**
 * Conditionaly renders compoent
 */
export function optional(flag: Param<boolean>, child: () => Children) {
    return when(flag, child, none);
}