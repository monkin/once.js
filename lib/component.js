export function component(factory) {
    return (props) => factory(props instanceof Function ? props : (() => props));
}
