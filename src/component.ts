import { El } from "./el";

/**
 * Allow component get properties as a function or objects
 */
export function component<T extends Object>(factory: (props: () => T) => El): (props: T | (() => T)) => El {
    return (props: T | (() => T)) => factory(props instanceof Function ? props : (() => props));
}
