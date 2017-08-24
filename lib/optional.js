import { when } from "./when";
import { none } from "./none";
export function optional(flag, child) {
    return when(flag, child, none);
}
