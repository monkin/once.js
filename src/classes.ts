
import { Param } from "./param";

export namespace Internal {
    export type SimplePrimitiveValue = string | null | undefined | false;
    export interface SimpleArrayValue extends Array<SimplePrimitiveValue | SimpleArrayValue> {};
    /**
     * Value that stringifies to string
     */
    export type SimpleValue = SimplePrimitiveValue | SimpleArrayValue;


    export type FlagsValue = { [key: string]: Param<boolean> };
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
                    r = Param.map(r, stringify(v), concat);
                });
                return r;
            } else if (typeof value === "string") {
                return value;
            } else if (value instanceof Function) {
                return () => stringify(value()) as string;
            } else {
                if (Object.keys(value).some(k => Param.isFunction(value[k]))) {
                    let prefix = "",
                        methods = [] as (() => string)[];
                    for (let i in value) {
                        let v = value[i];
                        if (Param.isValue(v)) {
                            if (v) {
                                prefix = concat(prefix, i);
                            }
                        } else {
                            ((i: string, v: () => boolean) => {
                                methods.push(() => v() ? i : "");
                            })(i, v);
                        }
                    }
                    return () => {
                        let r = prefix;
                        for (let m of methods) {
                            r = concat(r, m());
                        }
                        return r;
                    };
                } else {
                    let r = "";
                    for (let i in value) {
                        if (value[i]) {
                            r = concat(r, i);
                        }
                    }
                    return r;
                }
            }
        } else {
            return "";
        }
    }
}

export function classes(...classes: ClassValue[]): Param<string> {
    return ClassValue.stringify(classes);
}