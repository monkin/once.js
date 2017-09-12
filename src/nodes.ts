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
        let p = parent(nodes);
        each(nodes, n => p && p.removeChild(n));
    }
    export function append(parent: Node, nodes: Nodes) {
        each(nodes, n => parent.appendChild(n));
    }
    export function prepend(parent: Node, nodes: Nodes) {
        each(nodes, n => {
            let c = parent.firstChild;
            if (c) {
                parent.insertBefore(n, c);
            } else {
                parent.appendChild(n);
            }
        });
    }
    export function insertBefore(ref: Node, nodes: Nodes) {
        let parent = ref.parentNode;
        each(nodes, n => parent && parent.insertBefore(n, ref));
    }
    export function insertAfter(ref: Node, nodes: Nodes) {
        let next = ref.nextSibling,
            parent = ref.parentNode;
        if (next) {
            each(nodes, n => parent && parent.insertBefore(n, next));
        } else {
            parent && append(parent, nodes);
        }
    }
    export function last(nodes: Nodes) {
        return Array.isArray(nodes) ? nodes[1] : nodes;
    }
    export function first(nodes: Nodes) {
        return Array.isArray(nodes) ? nodes[0] : nodes;
    }
}
