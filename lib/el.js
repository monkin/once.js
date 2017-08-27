import { classes } from "./classes";
class ElImplementation {
    constructor(tag, namespace, attributes, children) {
        this.updaters = [];
        let node = namespace ? document.createElementNS(namespace, tag) : document.createElement(tag);
        // attach events and attributes
        for (let name in attributes) {
            if (name.startsWith("on")) {
                let handler = attributes[name];
                if (handler instanceof Function) {
                    node.addEventListener(name.replace(/^on/, "").toLowerCase(), handler);
                }
                else {
                    console.error(`Invalid event '${name}' handler: `, handler);
                    throw new Error(`Event handler must be a function bun '${JSON.stringify(handler)}' passed`);
                }
            }
            else {
                let isClass = name === "className", value = isClass ? classes(attributes.className) : attributes[name], realName = isClass ? "class" : name;
                if (value instanceof Function) {
                    ((realName, value) => {
                        let text = value();
                        if (text !== false) {
                            node.setAttribute(realName, text);
                        }
                        this.updaters.push(() => {
                            let newText = value();
                            if (newText !== text) {
                                text = newText;
                                if (text !== false) {
                                    node.setAttribute(realName, text);
                                }
                                else {
                                    node.removeAttribute(realName);
                                }
                            }
                        });
                    })(realName, value);
                }
                else {
                    node.setAttribute(realName, value);
                }
            }
        }
        // append children
        children.forEach(child => {
            if (typeof child === "string") {
                let text = document.createTextNode(child);
                node.appendChild(text);
            }
            else if (child instanceof Function) {
                let value = child(), text = document.createTextNode(value);
                this.updaters.push(() => {
                    let newValue = child();
                    if (newValue !== value) {
                        text.nodeValue = value = newValue;
                    }
                });
                node.appendChild(text);
            }
            else {
                append(node, child);
                this.updaters.push(() => child.update());
            }
        });
        this.node = node;
    }
    update() {
        this.updaters.forEach(update => {
            update();
        });
    }
    dispose() { }
}
function element(namespace, params) {
    let tag = "div", attributes = {}, children = [];
    for (let p of params) {
        if (typeof p === "string") {
            tag = p;
        }
        else if (Array.isArray(p)) {
            for (let c of p) {
                children.push(c);
            }
        }
        else {
            for (let i in p) {
                attributes[i] = p[i];
            }
        }
    }
    return new ElImplementation(tag, namespace, attributes, children);
}
export function el(...params) {
    return element(null, params);
}
export function svg(...params) {
    return element("http://www.w3.org/2000/svg", params);
}
export function nodes(el) {
    if (Array.isArray(el.node)) {
        let [a, b] = el.node, i = a, items = [];
        do {
            items.push(i);
            i = i.nextSibling;
        } while (i && i !== b);
        return items;
    }
    else {
        return [el.node];
    }
}
export function append(node, el) {
    if (node.lastChild !== lastNode(el)) {
        for (let n of nodes(el)) {
            node.appendChild(n);
        }
    }
    return node;
}
export function preppend(node, el) {
    if (node.firstChild) {
        insertBefore(node.firstChild, el);
    }
    else {
        append(node, el);
    }
    return node;
}
export function insertBefore(node, el) {
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
export function insertAfter(node, el) {
    let next = node.nextSibling;
    if (next !== firstNode(el) && node !== lastNode(el)) {
        if (next) {
            insertBefore(next, el);
        }
        else {
            node.parentNode && append(node.parentNode, el);
        }
    }
    return node;
}
export function detach(el) {
    for (let n of nodes(el)) {
        n.parentNode && n.parentNode.removeChild(n);
    }
    return el;
}
export function remove(el) {
    el.dispose();
    detach(el);
}
export function firstNode(el) {
    return Array.isArray(el.node) ? el.node[0] : el.node;
}
export function lastNode(el) {
    return Array.isArray(el.node) ? el.node[1] : el.node;
}
