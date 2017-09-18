
import { El } from "./el";
import { Actions } from "./actions";

export function beforeUpdate(el: El, update: Actions): El {
    return {
        node: el.node,
        update: Actions.merge(update, el.update),
        dispose: el.dispose
    };
}
export function afterUpdate(el: El, update: Actions): El {
    return {
        node: el.node,
        update: Actions.merge(Actions.clone(el.update), update),
        dispose: el.dispose
    };
}

export function beforeDispose(el: El, dispose: Actions): El {
    return {
        node: el.node,
        update: el.update,
        dispose: Actions.merge(dispose, el.dispose)
    }
}
export function afterDispose(el: El, dispose: Actions): El {
    return {
        node: el.node,
        update: el.update,
        dispose: Actions.merge(Actions.clone(el.dispose), dispose)
    }
}