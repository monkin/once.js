
import { El } from "./el";
import { state } from "./state";
import { disposable } from "./disposable"; 

const timeouts = new Map<number, (null | (() => void))[]>();

function timeout(callback: () => void, delay: number) {
    let now = Date.now(),
        time = Math.round((now + delay) / 30),
        entry = timeouts.get(time);
    if (entry) {
        entry.push(callback);
    } else {
        timeouts.set(time, [callback]);
        setTimeout(() => {
            let list = timeouts.get(time);
            if (list) {
                for (let i of list) {
                    i && i();
                }
            }
            timeouts.delete(time);
        }, Math.max(0, time - now));
    }
    return () => {
        let list = timeouts.get(time);
        if (list) {
            for (let i = 0; i < list.length; i++) {
                list[i] = null;
            }
        }
    }
}

export function debounce(element: El, delay: number): El {
    let node = Array.isArray(element.node) ? element.node[0] : element.node,
        timeoutDestructor: () => void,
        update = () => element.update();
    return {
        node: element.node,
        update() {
            timeoutDestructor && timeoutDestructor();
            timeoutDestructor = timeout(update, delay);
        },
        dispose() {
            timeoutDestructor && timeoutDestructor();
            element.dispose();
        }
    };
}

export function throttle(element: El, delay: number): El {
    let node = Array.isArray(element.node) ? element.node[0] : element.node,
        timeoutFlag = false,
        timeoutDestructor: undefined | (() => void) = undefined,
        lastUpdate: number = 0,
        update = () => {
            if (document.contains(node)) {
                timeoutFlag = false;
                element.update();
                lastUpdate = Date.now();
            }
        };
    return {
        node: element.node,
        update() {
            if (!timeoutFlag) {
                let now = Date.now(),
                    diff = now - lastUpdate;
                if (diff < delay) {
                    timeoutFlag = true;
                    timeoutDestructor = timeout(update, delay - diff);
                } else {
                    lastUpdate = now;
                    element.update();
                }
            }
        },
        dispose() {
            timeoutDestructor && timeoutDestructor();
            element.dispose();
        }
    };
}

export function timer(element: El, delay: number): El {
    return state(false, (get, set) => {
        let interval = setInterval(() => set(v => !v), delay);
        return disposable(element, () => clearInterval(interval));
    });
}