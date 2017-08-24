export function disposable(el, dispose) {
    return {
        node: el.node,
        update: () => el.update(),
        dispose() {
            el.dispose();
            dispose();
        }
    };
}
