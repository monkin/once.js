
import Param from "./param";

export namespace Internal {
    export type SimplePrimitiveValue = string | null | undefined | false;
    export interface SimpleArrayValue extends Array<SimplePrimitiveValue | SimpleArrayValue> {};
    export type SimpleValue = SimplePrimitiveValue | SimpleArrayValue;
    export type FlagsValue = { [key: string]: () => boolean };
    export interface ArrayValue extends Array<Param<SimpleValue> | FlagsValue | ArrayValue> {};

    export type ClassValue = Param<SimpleValue> | FlagsValue | ArrayValue;
}

export type ClassValue = Internal.ClassValue;

export namespace ClassValue {
    function concat(a?: string, b?: string): string {
        return a && b ? a + " " + b : (a || b || "");
    }
    export function stringify(value: ClassValue): Param<string> {
        if (value) {
            if (Array.isArray(value)) {
                let r: Param<string> = "";
                (value as ClassValue[]).forEach(v => {
                    r = Param.join(r, stringify(v), concat);
                });
                return r;
            } else if (typeof value === "string") {
                return value;
            } else if (value instanceof Function) {
                return Param.map(value, stringify as () => string);
            } else {
                return () => {
                    let r = "";
                    for (let i in value) {
                        if (value[i]()) {
                            r = concat(r, i);
                        }
                    }
                    return r;
                };
            }
        } else {
            return "";
        }
    }
}

export function classes(...classes: ClassValue[]) {
    return ClassValue.stringify(classes);
}