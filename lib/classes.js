export var Internal;
(function (Internal) {
    ;
    ;
})(Internal || (Internal = {}));
function concat(v1, v2) {
    return (v1 && v2) ? v1 + " " + v2 : (v1 || v2 || "");
}
function stringify(value) {
    if (value) {
        if (Array.isArray(value)) {
            let result = "";
            for (let v of value) {
                result = concat(result, stringify(v));
            }
            return result;
        }
        else if (typeof value === "string") {
            return value;
        }
        else {
            let result = "";
            for (let c in value) {
                if (value[c]) {
                    result = concat(result, c);
                }
            }
            return result;
        }
    }
    else {
        return "";
    }
}
function join(v1, v2) {
    if (v1 && v2) {
        if (v1 instanceof Function) {
            if (v2 instanceof Function) {
                return () => concat(v1(), v2());
            }
            else {
                return () => concat(v1(), v2);
            }
        }
        else {
            if (v2 instanceof Function) {
                return () => concat(v1, v2());
            }
            else {
                return concat(v1, v2);
            }
        }
    }
    else {
        return v1 || v2;
    }
}
function item(value) {
    if (value) {
        if (value instanceof Function) {
            return () => stringify(value());
        }
        else if (Array.isArray(value)) {
            let result = "";
            for (let c of value) {
                result = join(result, item(c));
            }
            return result;
        }
        else if (typeof value === "string") {
            return value;
        }
        else {
            let result = "";
            for (let c in value) {
                let v = value[c];
                if (v instanceof Function) {
                    result = join(result, ((c, v) => {
                        return () => v() ? c : "";
                    })(c, v));
                }
            }
            return result;
        }
    }
    else {
        return "";
    }
}
export function classes(...items) {
    return items.length === 1 ? item(items[0]) : item(items);
}
