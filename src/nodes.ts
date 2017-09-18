export type Nodes = Node | [Node, Node];

export namespace Nodes {
    export function range(name: string) {
        let fragment = document.createDocumentFragment(),
            begin = document.createComment(name),
            end = document.createComment("/" + name);
        fragment.appendChild(begin);
        fragment.appendChild(end);
        return [begin, end];
    }
    export function each(nodes: Nodes, callback: (node: Node) => void) {
        if (Array.isArray(nodes)) {
            let [begin, end] = nodes,
                i: Node | null = begin,
                s = end.nextSibling;
            while (i && i !== s) {
                let v: Node | null = i.nextSibling;
                callback(i);
                i = v;
            }
        } else {
            callback(nodes);
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
            each(nodes, n => fragment.appendChild(n));
        } else {
            let p = nodes.parentNode;
            p && p.removeChild(nodes);
        }
    }
    export function append(parent: Node, nodes: Nodes) {
        if (parent.lastChild !== last(nodes)) {
            each(nodes, n => parent.appendChild(n));
        }
    }
    export function prepend(parent: Node, nodes: Nodes) {
        if (parent.firstChild !== first(nodes)) {
            let c = parent.firstChild;
            each(nodes, n => {
                if (c) {
                    parent.insertBefore(n, c);
                } else {
                    parent.appendChild(n);
                }
            });
        }
    }
    export function insertBefore(ref: Node, nodes: Nodes) {
        if (ref.previousSibling !== last(nodes)) {
            let parent = ref.parentNode;
            each(nodes, n => parent && parent.insertBefore(n, ref));
        }
    }
    export function insertAfter(ref: Node, nodes: Nodes) {
        if (ref.nextSibling !== first(nodes)) {
            let next = ref.nextSibling,
                parent = ref.parentNode;
            if (next) {
                each(nodes, n => parent && parent.insertBefore(n, next));
            } else {
                parent && append(parent, nodes);
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
