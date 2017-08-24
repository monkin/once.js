import { insertAfter, lastNode, remove } from "./el";
/**
 * List of elements. List of lists won't work.
 */
export function list(data, map, optionalKey) {
    let key = optionalKey || ((v, i) => i), fragment = document.createDocumentFragment(), begin = document.createComment("list"), end = document.createComment("/list"), elements = new Map(), items = [], itemsProvider = () => items;
    fragment.appendChild(begin);
    fragment.appendChild(end);
    let result = {
        node: fragment,
        update: () => {
            items = data instanceof Function ? data() : data;
            let keys = new Set(), dirty = false;
            for (let i = 0; i < items.length; i++) {
                let v = items[i], k = key(v, i);
                if (!keys.has(k)) {
                    keys.add(k);
                }
                else {
                    throw new Error(`Repeated key ${JSON.stringify(k)} for list item ${JSON.stringify(v)}`);
                }
                if (elements.has(k)) {
                    let e = elements.get(k);
                    if (e && e.el) {
                        dirty = dirty || e.i !== i;
                        e.i = i;
                        e.v = v;
                        e.el.update();
                    }
                }
                else {
                    let d = { el: null, i, v };
                    (d => {
                        elements.set(k, d);
                        elements.set(k, Object.assign(d, { el: map(() => d.v, () => d.i, () => items) }));
                    })(d);
                    dirty = true;
                }
            }
            let toRemove = new Set();
            for (let x of elements.keys()) {
                if (!keys.has(x)) {
                    toRemove.add(x);
                }
            }
            for (let x of toRemove) {
                remove(elements.get(x).el);
                elements.delete(x);
            }
            if (dirty) {
                let n = begin;
                for (let k of keys) {
                    let item = elements.get(k).el;
                    insertAfter(n, item);
                    n = lastNode(item);
                }
            }
        },
        dispose() {
            for (let e of elements.values()) {
                e.el.dispose();
            }
        }
    };
    result.update();
    return result;
}
