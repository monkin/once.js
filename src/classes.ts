
export namespace Internal {
    export type PrimitiveValue = string | null | undefined | false;
    export interface ArrayValue extends Array<SimpleValue> { };
    export interface FlagsValue { [i: number]: boolean }
    export type SimpleValue =  PrimitiveValue | ArrayValue | FlagsValue;

    export interface ClassValueArray extends Array<ClassValue> { };
}

function concat(v1?: string, v2?: string) {
    return (v1 && v2) ? v1 + " " + v2 : (v1 || v2 || "");
}

function stringify(value: Internal.SimpleValue): string {
    if (value) {
        if (Array.isArray(value)) {
            let result = "";
            for (let v of value) {
                result = concat(result, stringify(v));
            }
            return result;
        } else if (typeof value === "string") {
            return value;
        } else {
            let result = "";
            for (let c in value) {
                if (value[c]) {
                    result = concat(result, c);
                }
            }
            return result;
        }
    } else {
        return "";
    }
}

export type ClassValue = Internal.SimpleValue
        | (() => Internal.SimpleValue)
        | { [key: string]: (boolean | (() => boolean)) }
        | Internal.ClassValueArray;


function join(v1: string | (() => string), v2: string | (() => string)) {
    if (v1 && v2) {
        if (v1 instanceof Function) {
            if (v2 instanceof Function) {
                return () => concat(v1(), v2());
            } else {
                return () => concat(v1(), v2);
            }
        } else {
            if (v2 instanceof Function) {
                return () => concat(v1, v2());
            } else {
                return concat(v1, v2);
            }
        }
    } else {
        return v1 || v2;
    }
}

function item(value: ClassValue): string | (() => string) {
    if (value) {
        if (value instanceof Function) {
            return () => stringify(value());
        } else if (Array.isArray(value)) {
            let result: string | (() => string) = "";
            for (let c of value) {
                result = join(result, item(c));
            }
            return result;
        } else if (typeof value === "string") {
            return value;
        } else {
            let result: string | (() => string) = "";
            for (let c in value) {
                let v = (value as { [key: string]: (boolean | (() => boolean)) })[c];
                if (v instanceof Function) {
                    result = join(result, ((c: string, v: (() => boolean)) => {
                        return () => v() ? c : "";
                    })(c, v));
                }
            }
            return result;
        }
    } else {
        return "";
    }
}

export function classes(...items: ClassValue[]): string | (() => string) {
    return items.length === 1 ? item(items[0]) : item(items);
}
