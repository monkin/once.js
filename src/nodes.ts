export type Nodes = Node | [Node, Node];

export namespace Nodes {
    export function* each(nodes: Nodes): IterableIterator<Node> {
        if (Array.isArray(nodes)) {
            let [begin, end] = nodes,
                i: Node | null = begin,
                s = end.nextSibling;
            while (i && i !== s) {
                let v: Node | null = i.nextSibling;
                yield i;
                i = v;
            }
        } else {
            yield nodes;
        }
    }
    export function parent(nodes: Nodes) {
        if (Array.isArray(nodes)) {
            return nodes[0].parentNode;
        } else {
            return nodes.parentNode;
        }
    }
    export function remove(nodes: Nodes) {
        if (Array.isArray(nodes)) {
            let fragment = document.createDocumentFragment();
            for (let n of each(nodes)) {
                fragment.appendChild(n);
            }
        } else {
            let p = nodes.parentNode;
            p && p.removeChild(nodes);
        }
    }
    export function append(parent: Node, nodes: Nodes) {
        if (parent.lastChild !== last(nodes)) {
            for (let n of each(nodes)) {
                parent.appendChild(n);
            }
        }
    }
    export function prepend(parent: Node, nodes: Nodes) {
        if (parent.firstChild !== first(nodes)) {
            let c = parent.firstChild;
            for (let n of each(nodes)) {
                if (c) {
                    parent.insertBefore(n, c);
                } else {
                    parent.appendChild(n);
                }
            }
        }
    }
    export function insertBefore(ref: Node, nodes: Nodes) {
        if (ref.previousSibling !== last(nodes)) {
            let parent = ref.parentNode;
            if (parent) {
                for (let n of each(nodes)) {
                    parent.insertBefore(n, ref);
                }
            }
        }
    }
    export function insertAfter(ref: Node, nodes: Nodes) {
        if (ref.nextSibling !== first(nodes)) {
            let next = ref.nextSibling,
                parent = ref.parentNode;
            if (parent) {
                if (next) {
                    for (let n of each(nodes)) {
                        parent.insertBefore(n, next);
                    }
                } else {
                    append(parent, nodes);
                }
            }
        }
    }
    export function last(nodes: Nodes) {
        return Array.isArray(nodes) ? nodes[1] : nodes;
    }
    export function first(nodes: Nodes) {
        return Array.isArray(nodes) ? nodes[0] : nodes;
    }
}
