
import { El, Children, children } from "./el";
import { state } from "./state";
import { beforeDispose } from "./hooks"; 
import { optional } from "./optional"

const timeouts = new Map<number, (null | (() => void))[]>();

const TIMER_SCALE = 30;

/**
 * Fast and low accuracy timeout
 */
export function timeout(callback: () => void, delay: number) {
    let now = Date.now(),
        time = Math.round((now + delay) / TIMER_SCALE),
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
                timeouts.delete(time);
            }
        }, Math.max(0, time * TIMER_SCALE - now));
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

/**
 * Delay element creation
 * @param create Element creation function
 * @param delay Element creation delay
 */
export function delay(create: () => Children, delay: number) {
    return state(false, (isReady, setReady) => {
        let disposeTimeout = timeout(() => setReady(true), delay);
        return beforeDispose(optional(isReady, create), disposeTimeout);
    });
}

/**
 * Call element update function only if it didn't called during a 'period'
 */
export function debounce(element: El, period: number): El {
    let node = Array.isArray(element.node) ? element.node[0] : element.node,
        timeoutDestructor: () => void,
        update = () => El.update(element);
    return {
        node: element.node,
        update() {
            timeoutDestructor && timeoutDestructor();
            timeoutDestructor = timeout(update, period);
        },
        dispose() {
            timeoutDestructor && timeoutDestructor();
            El.dispose(element);
        }
    };
}

/**
 * Call element update only once during period
 */
export function throttle(element: El, period: number): El {
    let node = Array.isArray(element.node) ? element.node[0] : element.node,
        timeoutFlag = false,
        timeoutDestructor: undefined | (() => void) = undefined,
        lastUpdate: number = 0,
        update = () => {
            if (document.contains(node)) {
                timeoutFlag = false;
                El.update(element);
                lastUpdate = Date.now();
            }
        };
    return {
        node: element.node,
        update() {
            if (!timeoutFlag) {
                let now = Date.now(),
                    diff = now - lastUpdate;
                if (diff < period) {
                    timeoutFlag = true;
                    timeoutDestructor = timeout(update, period - diff);
                } else {
                    lastUpdate = now;
                    El.update(element);
                }
            }
        },
        dispose() {
            timeoutDestructor && timeoutDestructor();
            El.dispose(element);
        }
    };
}

/**
 * Call element update function every 'delay' milliseconds
 */
export function timer(element: El, delay: number): El {
    return state(false, (get, set) => {
        let interval = setInterval(() => set(v => !v), delay);
        return beforeDispose(element, () => clearInterval(interval));
    });
}