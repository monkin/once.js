function nop() { }
/**
 * Empty component
 */
export function none() {
    return {
        update: nop,
        dispose: nop,
        node: document.createComment("none")
    };
}
