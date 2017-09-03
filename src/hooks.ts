
import { El } from "./el";

export function beforeUpdate(el: El, update: () => void): El {
    return {
        node: el.node,
        update: () => {
            update();
            el.update();
        },
        dispose: () => el.dispose()
    }
}
export function afterUpdate(el: El, update: () => void): El {
    return {
        node: el.node,
        update: () => {
            el.update();
            update();
        },
        dispose: () => el.dispose()
    }
}

export function beforeDispose(el: El, dispose: () => void): El {
    return {
        node: el.node,
        update: () => el.update(),
        dispose() {
            dispose();
            el.dispose();
        }
    }
}
export function afterDispose(el: El, dispose: () => void): El {
    return {
        node: el.node,
        update: () => el.update(),
        dispose() {
            el.dispose();
            dispose();
        }
    }
}