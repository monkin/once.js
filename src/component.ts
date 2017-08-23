import { El } from "./el";

export function component<T extends Object>(factory: (props: () => T) => El): (props: T | (() => T)) => El {
    return (props: T | (() => T)) => factory(props instanceof Function ? props : (() => props));
}
