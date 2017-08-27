export declare namespace Internal {
    type PrimitiveValue = string | null | undefined | false;
    interface ArrayValue extends Array<SimpleValue> {
    }
    interface FlagsValue {
        [i: number]: boolean;
    }
    type SimpleValue = PrimitiveValue | ArrayValue | FlagsValue;
    interface ClassValueArray extends Array<ClassValue> {
    }
}
export declare type ClassValue = Internal.SimpleValue | (() => Internal.SimpleValue) | {
    [key: string]: (boolean | (() => boolean));
} | Internal.ClassValueArray;
export declare function classes(...items: ClassValue[]): string | (() => string);
