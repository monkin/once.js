
import { El, Children, children } from "./el";
import { Actions } from "./actions";

export function beforeUpdate(child: Children, update: Actions): El {
    let el = children(child);
    return {
        node: el.node,
        update: Actions.merge(update, el.update),
        dispose: el.dispose
    };
}
export function afterUpdate(child: Children, update: Actions): El {
    let el = children(child);
    return {
        node: el.node,
        update: Actions.merge(Actions.clone(el.update), update),
        dispose: el.dispose
    };
}

export function beforeDispose(child: Children, dispose: Actions): El {
    let el = children(child);
    return {
        node: el.node,
        update: el.update,
        dispose: Actions.merge(dispose, el.dispose)
    };
}
export function afterDispose(child: Children, dispose: Actions): El {
    let el = children(child);
    return {
        node: el.node,
        update: el.update,
        dispose: Actions.merge(Actions.clone(el.dispose), dispose)
    };
}