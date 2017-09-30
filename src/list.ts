import { Actions } from "./actions"
import { Nodes } from "./nodes"
import { El, Children, children } from "./el";
import { Param } from "./param";

/**
 * List of elements 
 */
export function list<T>(data: Param<T[]>,
        map: (item: Param<T>, index: Param<number>, list: Param<T[]>) => Children,
        optionalKey?: (v: T, i: number) => any) {
    if (Param.isFunction(data)) {
        let key = optionalKey || ((v: T, i: number) => i),
            fragment = document.createDocumentFragment(),
            begin: Node = document.createComment("list"),
            end: Node = document.createComment("/list"),
            elements = new Map<any, { el: El, i: number, v: T }>(),
            items: T[] = [],
            itemsProvider = () => items;
        
        fragment.appendChild(begin);
        fragment.appendChild(end);
        
        let result = {
            node: [begin, end],
            update: () => {
                items = data();
                
                let keys = new Set<any>(),
                    reorderNeeded = false; // If true children must be reordered

                for (let i = 0; i < items.length; i++) {
                    let v = items[i],
                        k = key(v, i);
                    
                    if (!keys.has(k)) {
                        keys.add(k);
                    } else {
                        throw new Error(`Repeated key ${JSON.stringify(k)} for list item ${JSON.stringify(v)}`)
                    }

                    if (elements.has(k)) {
                        // Element with this key is already created
                        let e = elements.get(k);
                        if (e && e.el) {
                            reorderNeeded = reorderNeeded || e.i !== i;
                            e.i = i;
                            e.v = v;
                            El.update(e.el);
                        }
                    } else {
                        // We need to create new one element
                        let d = { el: null as any, i, v };
                        (d => {
                            elements.set(k, d);
                            elements.set(k, Object.assign(d, { el: children(map(() => d.v, () => d.i, () => items)) }));
                        })(d);

                        reorderNeeded = true;                    
                    }
                }

                // Remove all the outdated elements
                let toRemove = new Set<any>();
                for (let x of elements.keys()) {
                    if (!keys.has(x)) { 
                        toRemove.add(x);
                    }
                }
                for (let x of toRemove) {
                    El.remove((elements.get(x) as { el: El, i: number, v: T }).el);
                    elements.delete(x);
                }

                // Reorder nodes
                if (reorderNeeded) {
                    let n = begin;
                    for (let k of keys) {
                        let item = (elements.get(k) as { el: El, i: number, v: T }).el;
                        El.insertAfter(n, item);
                        n = Nodes.last(item.node);
                    }
                }
            },
            dispose() {
                for (let e of elements.values()) {
                    Actions.call(e.el.dispose);
                }
            }
        } as El;

        // Initialize items
        Actions.call(result.update);

        return result;
    } else {
        return children(data.map((v, i) => map(v, i, data)));
    }
}
