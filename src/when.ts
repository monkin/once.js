import { El, append, remove, insertAfter } from "./el";

export function when(flag: () => boolean, whenTrue: () => El, whenFalse: () => El): El {
    let fragment = document.createDocumentFragment(),
        begin = document.createComment("when"),
        end = document.createComment("/when"),
        flagValue = flag(),
        child = flagValue ? whenTrue() : whenFalse();
    
    fragment.appendChild(begin);
    append(fragment, child);
    fragment.appendChild(end);

    return {
        node: [begin, end],
        update() {
            let f = flag();
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
}