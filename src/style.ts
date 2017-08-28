
import { El, el, append, Attributes, Children, Parameter } from "./el";

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

export const style = (() => {
    let counter = 0,
        id = () => `c${(counter++).toString(16)}`,
        requested = false,
        queue = [] as string[],
        update = () => {
            try {
                let node = el("style", { type: "text/css" }, ["\n" + queue.join("/***/\n")]);
                append(document.head, node);
                queue = [];
            } finally {
                requested = false;
            }
        },
        request = (style: string) => {
            queue.push(style);
            if (!requested) {
                requested = true;
                requestAnimationFrame(update);
            }
        };


    function style(style: Style, name: string = "") {
        let className = (name ? name + "_" : "") + id();
        request(stringify("." + className, style));
        return className;
    }

    return style;
})();

export function stylesheet<T extends Stylesheet>(stylesheet: T): { [className in keyof T]: string } {
    let r: any = {};
    for (let c in stylesheet) {
        r[c] = style(stylesheet[c]);
    }
    return r;
}

export function styled(tag: string, predefinedStyle: Style, ...params: Parameter[]) {
    let className = style(predefinedStyle);
    return (...params: (Attributes | Children)[]) => {
        let attributes = {} as Attributes,
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
            attributes.className = [className, attributes.className];
        } else {
            attributes.className = className;
        }
    };
}
