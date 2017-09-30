import { El, Children, children } from "./el";

let counter = 0,
    refreshRequested = false,
    refreshProcessing = false,
    componentsToRefresh = new Set<El>();

function refresh(el?: El) {
    el && componentsToRefresh.add(el);

    if (!refreshRequested) {
        refreshRequested = true;
        requestAnimationFrame(() => {
            try {
                refreshProcessing = true;
                counter = (counter + 1) & 0xFFFF;
                componentsToRefresh.forEach(El.update);
                componentsToRefresh.clear();
            } finally {
                refreshRequested = false;
                refreshProcessing = false;
            }
        });
    }
}

/**
 * @param initial Initial state value
 * @param render Callback with parameters that helps to get and set state
 */
export function state<T>(initial: T, render: (get: () => T, set: (v: T | ((s: T) => T)) => void) => Children): El {
    let lastUpdate = counter - 1,
        current = initial,
        next: T | undefined = undefined,
        get = () => current,
        set = (v: T | ((s: T) => T)) => {
            if (!child) {
                throw new Error(`Can't change a state before child element creation`);
            }

            if (refreshProcessing) {
                throw new Error(`Can't set a state during components update`);
            }

            let newValue: T;
            if (v instanceof Function) {
                newValue = v(next === undefined ? current : next);
            } else {
                newValue = v;
            }

            if (next !== undefined || newValue !== current) {
                next = newValue;
                refresh(result);
            }
        },
        child = children(render(get, set)),
        result = {
            node: child.node,
            update() {
                if (refreshProcessing) {
                    if (lastUpdate !== counter) {
                        lastUpdate = counter;
                        if (next !== undefined) {
                            current = next;
                            next = undefined;
                        }
                        El.update(child);
                    }
                } else {
                    El.update(child);
                }
            },
            dispose() {
                El.update(child);
            }
        };
    return result;
}
