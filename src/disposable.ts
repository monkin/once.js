
import { El } from "./el";

/**
 * Bind release resources function to the element
 * Dispose function will be called on component remove
 */
export function disposable(el: El, dispose: () => void): El {
    return {
        node: el.node,
        update: () => el.update(),
        dispose() {
            el.dispose();
            dispose();
        }
    }
}