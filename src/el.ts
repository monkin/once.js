
import { Param } from "./param";
import { Nodes } from "./nodes";
import { Actions } from "./actions";

export namespace Internal {
    export type SimpleValue = string | null | boolean | number | undefined;
}

export type TextValue = Param<Internal.SimpleValue>;
export namespace TextValue {
    export function toString(text: TextValue): string {
        let v = Param.value(text);
        if (v === null || v === undefined) {
            return "";
        } else {
            if (typeof v === "number" || typeof v === "boolean") {
                return String(v);
            } else {
                return v;
            }
        }
    }
}

export type AttributeValue = TextValue | ((e: any) => void);
export type Attributes = {
    className?: TextValue;
    [key: string]: AttributeValue;
};
export namespace Attributes {
    export function eachHandler(attributes: Attributes, callback: (eventName: string, handler: (e: Event) => void) => void) {
        for (let i in attributes) {
            if (i.startsWith("on")) {
                let handler = attributes[i];
                if (handler instanceof Function) {
                    callback(i.substring(2).toLowerCase(), handler);
                } else {
                    throw new Error(`Event handler must be a function, '${handler}' passed`);
                }
            }
        }
    }

    export function eachText(attributes: Attributes, callback: (attrName: string, value: TextValue) => void) {
        for (let i in attributes) {
            let v = attributes[i];
            if (i === "className") {
                callback("class", v as TextValue);
            } else if (!i.startsWith("on")) {
                callback(i, v as TextValue);
            }
        }
    }
}

export type Children = Children.List | El | (() => Internal.SimpleValue) | null | undefined;
export namespace Children {
    export type Simple = El | TextValue;
    export interface List extends Array<Simple | List> {}

    export function* each(children: Children | Children.Simple): IterableIterator<Children.Simple> {
        if (children !== null && children !== undefined) {
            if (Array.isArray(children)) {
                for (let c of children) {
                    for (let r of each(c)) {
                        yield r;
                    }
                }
            } else {
                yield children;
            }
        }
    }
    export function toEl(c: Children.Simple): El {
        if (c === null || c === undefined) {
            return { node: document.createComment("empty") };
        } else if (typeof c === "string" || typeof c === "number" || typeof c === "boolean" || c instanceof Function) {
            return text(c);
        } else {
            return c;
        }
    }
}


export type Parameter = string | Attributes | Children;

export interface El {
    /**
     * Node or range of nodes
     */
    readonly node: Nodes;
    /**
     * Element update function
     */
    readonly update?: Actions;
    /**
     * Release all the resources binded to the element
     */
    readonly dispose?: Actions;
}

export namespace El {
    export function remove(el: El) {
        Actions.call(el.dispose);
        Nodes.remove(el.node);
    }
    export function append(parent: Node, el: El) {
        Nodes.append(parent, el.node);
    }
    export function prepend(parent: Node, el: El) {
        Nodes.prepend(parent, el.node);
    }
    export function insertBefore(node: Node, el: El) {
        Nodes.insertBefore(node, el.node);
    }
    export function insertAfter(node: Node, el: El) {
        Nodes.insertAfter(node, el.node);
    }
    export function update(el: El) {
        Actions.call(el.update);
    }
    export function dispose(el: El) {
        Actions.call(el.dispose);
    }
    export function isEl(v: any): v is El {
        if (v && v.node) {
            if (v.node instanceof Node) {
                return true;
            } else if (Array.isArray(v.node) && v.node.length === 2) {
                return (v.node[0] instanceof Node) && (v.node[1] instanceof Node);
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    // HtmlEl implementation

    function setAttribute(node: Element, name: string, value: Internal.SimpleValue) {
        if (name === "contenteditable" && value === false) {
            node.setAttribute(name, "false");
        } else if (value === null || value === undefined || value === false) {
            if (name === "contenteditable" && value === false) {
                node.setAttribute(name, "false");
            } else {
                node.removeAttribute(name);
            }
        } else if (typeof value === "number") {
            node.setAttribute(name, value.toString());
        } else if (value === true) {
            node.setAttribute(name, name === "contenteditable" ? "true" : name);
        } else {
            node.setAttribute(name, value);
        }
    }

    function attachAttribute(el: { node: Element, update?: Actions, dispose?: Actions }, name: string, value: TextValue) {
        let isValue = name === value,
            old: Internal.SimpleValue = undefined;
        el.update = Actions.merge(el.update, Param.update(value, v => {
            if (v !== (isValue ? (el.node as HTMLInputElement).value : old)) {
                old = v;
                setAttribute(el.node, name, v);
            }
        }));
    }
    function attachHandler(node: Node, name: string, handler: (e: Event) => void) {
        node.addEventListener(name, handler);
    }
    
    export function create(tag: string, namespace: string | null, attributes: Attributes, content: Children) {
        let node = namespace ? document.createElementNS(namespace, tag) : document.createElement(tag),
            el: { node: Element, update?: Actions, dispose?: Actions } = { node };

        Attributes.eachHandler(attributes, (name, handler) => attachHandler(node, name, handler));
        Attributes.eachText(attributes, (name, value) => attachAttribute(el, name, value));

        let c = children(content);
        El.append(node, c);
        el.update = Actions.merge(el.update, c.update);
        el.dispose = c.dispose;
        el.node = node;
        return el;
    }
}

export interface SimpleEl {
    node: Node;
    update?: Actions;
    dispose?: Actions;
}

function element(namespace: string | null, params: Parameter[]): SimpleEl {
    let tag = "div",
        attributes = {} as Attributes,
        children = [] as Children.List;
    for (let p of params) {
        if (p !== null && p !== undefined) {
            if (typeof p === "string") {
                tag = p;
            } else if (Array.isArray(p)) {
                for (let c of p) {
                    children.push(c);
                }
            } else if (El.isEl(p)) {
                children.push(p);
            } else if (typeof p === "object") {
                for (let i in p) {
                    attributes[i] = p[i];
                }
            } else {
                children.push(text(p));
            }
        }
    }
    return El.create(tag, namespace, attributes, children);
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

export function text(text: TextValue): SimpleEl {
    let node = document.createTextNode(""),
        old: Internal.SimpleValue = "";
    return {
        node,
        update: Param.update(text, (v) => {
            if (v !== old) {
                old = v;
                node.textContent = TextValue.toString(v);
            }
        })
    };
}

function identity<T>(v: T) { return v; }

export function children(items: Children, callback: ((children: El) => El) = identity): El {
    if (El.isEl(items)) {
        let r = callback({ node: items.node });
        return {
            node: r.node,
            update: Actions.merge(Actions.clone(r.update), items.update),
            dispose: Actions.merge(Actions.clone(r.dispose), items.dispose)
        };
    } else if (items) {
        let fragment = document.createDocumentFragment(),
            update: Actions = null,
            dispose: Actions = null;
        for (let i of Children.each(items)) {
            let n = Children.toEl(i);
            El.append(fragment, n);
            update = Actions.merge(update, n.update);
            dispose = Actions.merge(dispose, n.dispose); 
        }

        let { firstChild, lastChild } = fragment,
            r = callback({ node: firstChild === lastChild ? firstChild : [firstChild, lastChild] } as El);
        return {
            node: r.node,
            update: Actions.merge(Actions.clone(r.update), update),
            dispose: Actions.merge(Actions.clone(r.dispose), dispose)
        };
    } else {
        return callback({ node: document.createComment("empty") });
    }
}