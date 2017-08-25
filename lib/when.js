import { append, remove, insertAfter } from "./el";
/**
 * Renders one of two components
 * @param flag Predicat to decide which component should be rendered
 */
export function when(flag, whenTrue, whenFalse) {
    let fragment = document.createDocumentFragment(), begin = document.createComment("when"), end = document.createComment("/when"), flagValue = flag(), child = flagValue ? whenTrue() : whenFalse();
    fragment.appendChild(begin);
    append(fragment, child);
    fragment.appendChild(end);
    return {
        node: [begin, end],
        update() {
            let f = flag();
            if (f === flagValue) {
                child.update();
            }
            else {
                flagValue = f;
                remove(child);
                child = flagValue ? whenTrue() : whenFalse();
                insertAfter(begin, child);
            }
        },
        dispose() {
            child.dispose();
        }
    };
}
