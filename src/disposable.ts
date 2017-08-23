
import { El } from "./el";

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