import { El, Children, children } from "./el";
import { Param } from "./param";

/**
 * Renders one of two components
 * @param flag Predicat to decide which component should be rendered
 */
export function when(flag: Param<boolean>, whenTrue: () => Children, whenFalse: () => Children): El {
    if (Param.isFunction(flag)) {
        let fragment = document.createDocumentFragment(),
            begin = document.createComment("when"),
            end = document.createComment("/when"),
            flagValue = Param.value(flag),
            child = children(flagValue ? whenTrue() : whenFalse());
        
        fragment.appendChild(begin);
        El.append(fragment, child);
        fragment.appendChild(end);

        return {
            node: [begin, end],
            update() {
                let f = Param.value(flag);
                if (f === flagValue) {
                    El.update(child);
                } else {
                    flagValue = f;
                    El.remove(child);
                    child = children(flagValue ? whenTrue() : whenFalse());
                    El.insertAfter(begin, child);
                }
            },
            dispose() {
                El.dispose(child);
            }
        };
    } else {
        return children(flag ? whenTrue() : whenFalse());
    }
}