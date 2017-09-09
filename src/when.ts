import { El, append, remove, insertAfter } from "./el";
import { Param } from "./param";

/**
 * Renders one of two components
 * @param flag Predicat to decide which component should be rendered
 */
export function when(flag: Param<boolean>, whenTrue: () => El, whenFalse: () => El): El {
    if (Param.isFunction(flag)) {
        let fragment = document.createDocumentFragment(),
            begin = document.createComment("when"),
            end = document.createComment("/when"),
            flagValue = Param.value(flag),
            child = flagValue ? whenTrue() : whenFalse();
        
        fragment.appendChild(begin);
        append(fragment, child);
        fragment.appendChild(end);

        return {
            node: [begin, end],
            update() {
                let f = Param.value(flag);
                if (f === flagValue) {
                    child.update();
                } else {
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
    } else {
        return flag ? whenTrue() : whenFalse();
    }
}