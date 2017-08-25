import { when } from "./when";
import { none } from "./none";
/**
 * Conditionaly renders compoent
 */
export function optional(flag, child) {
    return when(flag, child, none);
}
