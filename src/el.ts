
import { classes, ClassValue } from "./classes";
import Param from "./param";

export type TextValue = Param<string | null | false | number | undefined>;
export namespace TextValue {
    export function toString(v: TextValue): string {
        let vv = Param.value(v);
        if (vv === null || vv === false || vv === undefined) {
            return "";
        } else {
            if (typeof vv === "number") {
                return vv.toString();
            } else {
                return vv;
            }
        }
    }
}

export type AttributeSimpleTextValue = string | boolean | null | undefined | number;
export type AttributeTextValue = Param<AttributeSimpleTextValue>;
export type AttributeHandlerValue = (e: any) => void;
export type AttributeValue = AttributeTextValue | AttributeHandlerValue;
export type Attributes = { className?: ClassValue } & {
    [key: string]: AttributeValue;
};
export namespace Attributes {
    export function eachHandler(attributes: Attributes, callback: (eventName: string, handler: (e: Event) => void) => void) {
        for (let i in attributes) {
            if (i.startsWith("on")) {
                let handler = attributes[i];
                if (handler instanceof Function) {
                    callback(i.substring(2), handler);
                } else {
                    throw new Error(`Event handler must be a function, '${handler}' passed`);
                }
            }
        }
    }

    export function eachText(attributes: Attributes, callback: (attrName: string, value: AttributeTextValue) => void) {
        for (let i in attributes) {
            let v = attributes[i];
            if (i === "className") {
                callback("class", v as AttributeTextValue);
            } else if (!i.startsWith("on")) {
                callback(i, v as AttributeTextValue);
            }
        }
    }
}

export type Children = (El | TextValue)[];
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
    update(this: SimpleEl): void;
    dispose(this: SimpleEl): void;
}

class ElImplementation implements El {
    readonly node: Element;
    private updaters = [] as (() => void)[];
    private destructors = [] as (() => void)[];

    private setAttribute(name: string, value: AttributeSimpleTextValue) {
        if (name === "contenteditable" && value === false) {
            this.node.setAttribute(name, "false");
        } else if (value === null || value === undefined || value === false) {
            this.node.removeAttribute(name);
        } else if (typeof value === "number") {
            this.node.setAttribute(name, value.toString());
        } else if (value === true) {
            this.node.setAttribute(name, name === "contenteditable" ? "true" : name);
        } else {
            this.node.setAttribute(name, value);
        }
    }
    
    constructor(tag: string, namespace: string | null, attributes: Attributes, content: Children) {
        let node = namespace ? document.createElementNS(namespace, tag) : document.createElement(tag);

        Attributes.eachHandler(attributes, (name, handler) => node.addEventListener(name, handler));
        Attributes.eachText(attributes, (name, value) => {
            this.setAttribute(name, Param.value(value));
            if (value instanceof Function) {
                this.updaters.push(() => this.setAttribute(name, value()));
            }
        });

        append(node, children(content));

        this.node = node;
    }
    update() {
        this.updaters.forEach(update => update());
    }
    dispose() {
        this.destructors.forEach(dispose => dispose());
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

export function children(items?: Children | null): El {
    if (items && items.length) {
        let fragment = document.createDocumentFragment(),
            elements: El[] = [];
        for (let i of items) {
            if (typeof i === "string" || typeof i === "number" || i instanceof Function) {
                let n = text(String(i));
                fragment.appendChild(n.node);
                elements.push(n);
            } else if (i) {
                append(fragment, i);
                elements.push(i);
            }
        }
        return {
            node: elements.length > 1 ? [fragment.firstChild, fragment.lastChild] : elements[0].node,
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
        } as El;
    } else {
        return {
            node: document.createDocumentFragment(),
            update: noop,
            dispose: noop
        };
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
