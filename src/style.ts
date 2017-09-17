import { El, SimpleEl, el, Attributes, Children, Parameter } from "./el";
import { ClassValue, classes } from "./classes";
import { Param } from "./param";

export interface Style {
    ":hover"?: Style;
    ":active"?: Style;
    ":after"?: Style;
    ":before"?: Style;
    ":first-child"?: Style;
    ":last-child"?: Style;
    [key: string]: string | 0 | Style | undefined;
}

export interface Stylesheet {
    [className: string]: Style;
}

export interface InlineStyle {
    [key: string]: Param<string | 0 | undefined>;
}

export interface Keyframes {
    [className: string]: {
        [property: string]: string | 0;
    }
}

function toKebabCase(s: string) {
    return s.replace(/[A-Z]/g, v => `-${v.toLowerCase()}`);
}

function stringify(prefix: string, style: Style) {
    let own = "",
        after = "";
    for (let i in style) {
        let v = style[i];
        if (typeof v === "string" || typeof v === "number") {
            own += `\t${toKebabCase(i)}: ${v};\n`;
        } else if (v) {
            after += stringify(prefix + i, v);
        }
    }
    return `${prefix} {\n${own}}\n${after}\n`
}


let counter = 0,
    id = () => `c${(counter++).toFixed(0)}`,
    requested = false,
    queue = [] as string[],
    process = () => {
        try {
            let node = el("style", { type: "text/css" }, ["\n" + queue.join("/***/\n")]);
            El.append(document.head, node);
            queue = [];
        } finally {
            requested = false;
        }
    },
    request = (style: string) => {
        queue.push(style);
        if (!requested) {
            requested = true;
            requestAnimationFrame(process);
        }
    };

export function keyframes(keyframes: Keyframes) {
    let name = id(),
        r = "";
    for (let i in keyframes) {
        r += stringify(i, keyframes[i]).replace(/\n\s+/g, m => `${m}\t`);
    }
    request(`@keyframes ${name} {\n${r}}\n`);
    return name;
}

export function style(style: Style, name: string = "") {
    let className = (name ? name + "-" : "") + id();
    request(stringify("." + className, style));
    return className;
}

export function stylesheet<T extends Stylesheet>(stylesheet: T): { [className in keyof T]: string } {
    let r: any = {};
    for (let c in stylesheet) {
        r[c] = style(stylesheet[c], c);
    }
    return r;
}

export function styled(tag: string, predefinedStyle: Style, predefinedAttributes?: Attributes) {
    let className = style(predefinedStyle);
    return (...params: (Attributes | Children)[]) => {
        let attributes: Attributes = predefinedAttributes ? {...predefinedAttributes} : {},
            children = [] as Children;
        for (let p of params) {
            if (Array.isArray(p)) {
                children = children.concat(p);
            } else {
                for (let a in p) {
                    attributes[a] = p[a];
                }
            }
        }

        if (attributes.hasOwnProperty("className")) {
            attributes.className = classes(className, attributes.className as ClassValue);
        } else {
            attributes.className = className;
        }

        return el(tag, attributes, children);
    };
}

export function inline(style: InlineStyle) {
    let prefix: string = "",
        functions: (() => string | undefined)[] = [];
    for (let i in style) {
        let key = toKebabCase(i),
            v = style[i];
        if (Param.isFunction(v)) {
            ((key, f) => {
                functions.push(() => {
                    let fv = f();
                    if (fv || fv === 0) {
                        return `${key}: ${fv};`;
                    }
                });
            })(key, v);
        } else {
            if (v || v === 0) {
                prefix += (prefix ? " " : "") + key + ": " + v + ";";
            }
        }
    }
    if (functions.length) {
        return () => {
            let r = prefix;
            for (let f of functions) {
                let v = f();
                if (v) {
                    r += (r ? " " : "") + v;
                }
            }
            return r;
        };
    } else {
        return prefix;
    }
}
