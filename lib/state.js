let counter = 0, refreshRequested = false, refreshProcessing = false, componentsToRefresh = new Set();
function refresh(el) {
    el && componentsToRefresh.add(el);
    if (!refreshRequested) {
        refreshRequested = true;
        requestAnimationFrame(() => {
            try {
                refreshProcessing = true;
                counter = (counter + 1) & 0xFFFF;
                componentsToRefresh.forEach(c => c.update());
                componentsToRefresh.clear();
            }
            finally {
                refreshRequested = false;
                refreshProcessing = false;
            }
        });
    }
}
export function state(initial, render) {
    let lastUpdate = counter - 1, current = initial, next = undefined, get = () => current, set = (v) => {
        if (!child) {
            throw new Error(`Can't change a state before child element creation`);
        }
        if (refreshProcessing) {
            throw new Error(`Can't set a state during components update`);
        }
        let newValue;
        if (v instanceof Function) {
            newValue = v(next === undefined ? current : next);
        }
        else {
            newValue = v;
        }
        if (next !== undefined || newValue !== current) {
            next = newValue;
            refresh(result);
        }
    }, child = render(get, set), result = {
        node: child.node,
        update() {
            if (refreshProcessing) {
                if (lastUpdate !== counter) {
                    lastUpdate = counter;
                    if (next !== undefined) {
                        current = next;
                        next = undefined;
                    }
                    child.update();
                }
            }
            else {
                child.update();
            }
        },
        dispose() {
            child.dispose();
        }
    };
    return result;
}
