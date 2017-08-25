
import { El } from "./el";

function nop() {}

/**
 * Empty component
 */
export function none(): El {
    return {
        update: nop,
        dispose: nop,
        node: document.createComment("none")
    };
}