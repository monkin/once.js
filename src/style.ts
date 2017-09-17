import { El, SimpleEl, el, Attributes, Children, Parameter } from "./el";
import { ClassValue, classes } from "./classes";

export interface Style {
    ":hover"?: Style;
    ":active"?: Style;
    ":after"?: Style;
    ":before"?: Style;
    ":first-child"?: Style;
    ":last-child"?: Style;
    [key: string]: string | Style | undefined;
}

export interface Stylesheet {
    [className: string]: Style;
}

export interface Keyframes {
    [className: string]: {
        [property: string]: string;
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
        if (typeof v === "string") {
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
