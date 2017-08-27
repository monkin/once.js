import { ClassValue } from "./classes";
export declare type Attributes = {
    className?: ClassValue;
} & {
    [key: string]: (string | (() => string | false) | ((e: Event) => void));
};
export declare type Children = (El | string | (() => string))[];
export declare type Parameter = string | Attributes | Children;
export interface El {
    /**
     * Node or range of nodes
     */
    readonly node: Node | [Node, Node];
    /**
     * Element update function
     */
    update(this: El): void;
    /**
     * Release all the resources binded to the element
     */
    dispose(this: El): void;
}
export declare function el(...params: Parameter[]): {
    node: Node;
    update(): void;
};
export declare function svg(...params: Parameter[]): {
    node: Node;
    update(): void;
};
export declare function nodes(el: El): Node[];
export declare function append(node: Node, el: El): Node;
export declare function preppend(node: Node, el: El): Node;
export declare function insertBefore(node: Node, el: El): Node | undefined;
export declare function insertAfter(node: Node, el: El): Node;
export declare function detach(el: El): El;
export declare function remove(el: El): void;
export declare function firstNode(el: El): Node;
export declare function lastNode(el: El): Node;
