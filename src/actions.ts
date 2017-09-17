
export type Actions = null | undefined | (() => void) | Actions.ActionsArray;

export namespace Actions {
    export interface ActionsArray extends Array<Actions> {};

    export function merge(a1: Actions, a2: Actions): Actions {
        if (a1 && a2) {
            if (Array.isArray(a1)) {
                a1.push(a2);
                return a1;
            } else {
                return [a1, a2];
            }
        } else {
            if (a1) {
                return a1;
            } else if (Array.isArray(a2)) {
                return a2.slice();
            } else {
                return a2;
            }
        }
    }
    export function call(a: Actions) {
        if (a) {
            if (Array.isArray(a)) {
                for (let i of a) {
                    call(i);
                }
            } else {
                a();
            }
        }
    }
}