import { state } from "./state";
import { disposable } from "./disposable";
import { optional } from "./optional";
const timeouts = new Map();
/**
 * Fast and low accuracy timeout
 */
function timeout(callback, delay) {
    let now = Date.now(), time = Math.round((now + delay) / 30), entry = timeouts.get(time);
    if (entry) {
        entry.push(callback);
    }
    else {
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
    };
}
/**
 * Delay element creation
 * @param create Element creation function
 * @param delay Element creation delay
 */
export function delay(create, delay) {
    return state(false, (isReady, setReady) => {
        let disposeTimeout = timeout(() => setReady(true), delay);
        return disposable(optional(isReady, create), disposeTimeout);
    });
}
/**
 * Call element update function only if it didn't called during a 'period'
 */
export function debounce(element, period) {
    let node = Array.isArray(element.node) ? element.node[0] : element.node, timeoutDestructor, update = () => element.update();
    return {
        node: element.node,
        update() {
            timeoutDestructor && timeoutDestructor();
            timeoutDestructor = timeout(update, period);
        },
        dispose() {
            timeoutDestructor && timeoutDestructor();
            element.dispose();
        }
    };
}
/**
 * Call element update only once during period
 */
export function throttle(element, period) {
    let node = Array.isArray(element.node) ? element.node[0] : element.node, timeoutFlag = false, timeoutDestructor = undefined, lastUpdate = 0, update = () => {
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
                let now = Date.now(), diff = now - lastUpdate;
                if (diff < period) {
                    timeoutFlag = true;
                    timeoutDestructor = timeout(update, period - diff);
                }
                else {
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
/**
 * Call element update function every 'delay' milliseconds
 */
export function timer(element, delay) {
    return state(false, (get, set) => {
        let interval = setInterval(() => set(v => !v), delay);
        return disposable(element, () => clearInterval(interval));
    });
}
