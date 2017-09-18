
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

export type Children = (El | TextValue)[];
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
}

export interface SimpleEl {
    node: Node;
    update?: Actions;
    dispose?: Actions;
}

class ElImplementation implements El {
    readonly node: Element;

    private setAttribute(name: string, value: Internal.SimpleValue) {
        if (name === "contenteditable" && value === false) {
            this.node.setAttribute(name, "false");
        } else if (value === null || value === undefined || value === false) {
            if (name === "contenteditable" && value === false) {
                this.node.setAttribute(name, "false");
            } else {
                this.node.removeAttribute(name);
            }
        } else if (typeof value === "number") {
            this.node.setAttribute(name, value.toString());
        } else if (value === true) {
            this.node.setAttribute(name, name === "contenteditable" ? "true" : name);
        } else {
            this.node.setAttribute(name, value);
        }
    }

    private attachAttribute = (name: string, value: TextValue) => {
        let isValue = name === value,
            old: Internal.SimpleValue = undefined;
        this.update = Actions.merge(this.update, Param.update(value, v => {
            if (v !== (isValue ? (this.node as HTMLInputElement).value : old)) {
                old = v;
                this.setAttribute(name, v);
            }
        }));
    }
    private attachHandler = (name: string, handler: (e: Event) => void) => {
        this.node.addEventListener(name, handler);
    }
    
    constructor(tag: string, namespace: string | null, attributes: Attributes, content: Children) {
        let node = namespace ? document.createElementNS(namespace, tag) : document.createElement(tag);

        Attributes.eachHandler(attributes, this.attachHandler);
        Attributes.eachText(attributes, this.attachAttribute);

        let c = children(content);
        El.append(node, c);
        this.update = Actions.merge(this.update, c.update);
        this.dispose = c.dispose;
        this.node = node;
    }
    update: Actions = null;
    dispose: Actions = null;
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

export function children(items: Children | null | undefined, callback: ((children: El) => El) = identity): El {
    if (items && items.length) {
        let fragment = document.createDocumentFragment(),
            update: Actions = null,
            dispose: Actions = null;
        for (let i of items) {
            if (typeof i === "string" || typeof i === "number" || typeof i === "boolean" || i instanceof Function) {
                let t = text(i);
                fragment.appendChild(t.node);
                update = Actions.merge(update, t.update);
            } else if (i) {
                El.append(fragment, i);
                update = Actions.merge(update, i.update);
                dispose = Actions.merge(dispose, i.dispose);
            }
        }

        let { firstChild, lastChild } = fragment,
            r = callback({ node: firstChild === lastChild ? firstChild : [firstChild, lastChild] } as El);
        return {
            node: r.node,
            update: Actions.merge(Actions.clone(r.update), update),
            dispose: Actions.merge(Actions.clone(r.dispose), dispose)
        };
    } else {
        return callback({ node: document.createComment("children") });
    }
}