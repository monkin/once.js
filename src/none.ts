
import { El } from "./el";

/**
 * Empty component
 */
export function none(): El {
    return { node: document.createComment("none") };
}