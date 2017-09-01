
import { classes, ClassValue } from "./classes";

export type Attributes = { className?: ClassValue } & {
    [key: string]: (string | boolean | (() => string | boolean | null) | ((e: Event) => void));
};

export type Children = (El | string | (() => string | null | false))[];
export type Parameter = string | Attributes | Children;

export interface El {
    /**
     * Node or range of nodes
     */
    readonly node: Node | [Node, Node];
    /**
     * Element update function
     */
    update(this: El): void;
    /**
     * Release all the resources binded to the element
     */
    dispose(this: El): void;
}

export interface SimpleEl {
    node: Node;
    update(): void;
    dispose(): void;
}

class ElImplementation implements El {
    readonly node: Element;
    private updaters = [] as (() => void)[];
    private destructors = [] as (() => void)[];
    
    constructor(tag: string, namespace: string | null, attributes: Attributes, childList: Children) {
        let node = namespace ? document.createElementNS(namespace, tag) : document.createElement(tag);

        // attach events and attributes
        for (let name in attributes) {
            if (name.startsWith("on")) {
                let handler = attributes[name];
                if (handler instanceof Function) {
                    node.addEventListener(name.replace(/^on/, "").toLowerCase(), handler as (() => void));
                } else {
                    console.error(`Invalid event '${name}' handler: `, handler);
                    throw new Error(`Event handler must be a function bun '${JSON.stringify(handler)}' passed`);
                }
            } else {
                let isClass = name === "className",
                    value = isClass ? classes(attributes.className) : attributes[name],
                    realName = isClass ? "class" : name;
                if (value instanceof Function) {
                    ((realName, value: Function) => {
                        let text = value() as (string | boolean);
                        if (text !== false) {
                            node.setAttribute(realName, text === true ? "" : text);
                        }
                        this.updaters.push(() => {
                            let newText = value();
                            if (newText !== text) {
                                text = newText;
                                if (text !== false && text !== null) {
                                    node.setAttribute(realName, text === true ? "" : text);
                                } else {
                                    node.removeAttribute(realName);
                                }
                            }
                        });
                    })(realName, value);
                } else {
                    if (value !== false) {
                        node.setAttribute(realName, value === true ? "" : value);
                    }
                }
            }
        }

        append(node, children(childList));

        this.node = node;
    }
    update() {
        this.updaters.forEach(update => {
            update();
        });
    }
    dispose() {
        for (let i of this.destructors) {
            i();
        }
    }
}

function element(namespace: string | null, params: Parameter[]): SimpleEl {
    let tag = "div",
        attributes = {} as Attributes,
        children = [] as Children;
    for (let p of params) {
        if (typeof p === "string") {
            tag = p;
        } else if (Array.isArray(p)) {
            for (let c of p) {
                children.push(c);
            }
        } else {
            for (let i in p) {
                attributes[i] = p[i];
            }
        }
    }
    return new ElImplementation(tag, namespace, attributes, children);
}

export function el(tag: string, attributes: Attributes, children: Children): SimpleEl;
export function el(attributes: Attributes, children: Children): SimpleEl;
export function el(tag: string, children: Children): SimpleEl;
export function el(tag: string, attributes: Attributes): SimpleEl;
export function el(children: Children): SimpleEl;
export function el(tag: string): SimpleEl;
export function el(attributes: Attributes): SimpleEl;
export function el(): SimpleEl;

export function el(...params: Parameter[]) {
    return element(null, params);
}
export function svg(...params: Parameter[]) {
    return element("http://www.w3.org/2000/svg", params)
}

function noop() {}
export function text(text: string | (() => string | null | false)): SimpleEl {
    let isFunction = text instanceof Function,
        content = text instanceof Function ? text() || "" : text,
        node = document.createTextNode(content);
    return {
        node,
        update: isFunction ? () => {
                let newContent: string = (text as Function)() || "";
                if (newContent !== content) {
                    node.textContent = content = newContent;
                }
            } : noop,
        dispose: noop
    }
}

export function children(items: Children) {
    let fragment = document.createDocumentFragment(),
        elements: El[] = [];
    for (let i of items) {
        if (typeof i === "string" || i instanceof Function) {
            let n = text(i);
            fragment.appendChild(n.node);
            elements.push(n);
        } else {
            append(fragment, i);
            elements.push(i);
        }
    }
    return {
        node: fragment,
        update() {
            for (let e of elements) {
                e.update();
            }
        },
        dispose() {
            for (let e of elements) {
                e.dispose();
            }
        }
    }
}

export function nodes(el: El) {
    if (Array.isArray(el.node)) {
        let [a, b] = el.node,
            i = a,
            items = [] as Node[];
        do {
            items.push(i);
            i = i.nextSibling as Node;
        } while(i && i !== b);
        return items;
    } else {
        return [el.node];
    }
}

export function append(node: Node, el: El) {
    if (node.lastChild !== lastNode(el)) {
        for (let n of nodes(el)) {
            node.appendChild(n);
        }
    }
    return node;
}
export function preppend(node: Node, el: El) {
    if (node.firstChild) {
        insertBefore(node.firstChild, el);
    } else {
        append(node, el);
    }
    return node;
}
export function insertBefore(node: Node, el: El) {
    if (node.previousSibling !== lastNode(el) && node !== firstNode(el)) {
        let p = node.parentNode;
        if (p) {
            for (let n of nodes(el)) {
                p.insertBefore(n, node);
            }
        }
        return node;
    }
}
export function insertAfter(node: Node, el: El) {
    let next = node.nextSibling;
    if (next !== firstNode(el) && node !== lastNode(el)) {
        if (next) {
            insertBefore(next, el);
        } else {
            node.parentNode && append(node.parentNode, el);
        }
    }
    return node;
}
export function detach(el: El) {
    for (let n of nodes(el)) {
        n.parentNode && n.parentNode.removeChild(n);
    }
    return el;
}
export function remove(el: El) {
    el.dispose();
    detach(el);
}
export function firstNode(el: El) {
    return Array.isArray(el.node) ? el.node[0] : el.node;
}
export function lastNode(el: El) {
    return Array.isArray(el.node) ? el.node[1] : el.node;
}
