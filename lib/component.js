/**
 * Allow component get properties as a function or objects
 */
export function component(factory) {
    return (props) => factory(props instanceof Function ? props : (() => props));
}
