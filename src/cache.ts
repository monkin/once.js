
import { Param } from "./param"
import { beforeUpdate } from "./hooks";
import { El } from "./el";

export function cache<T>(data: Param<T>, render: (cached: Param<T>) => El) {
    if (data instanceof Function) {
        let value = Param.value(data);
        return beforeUpdate(render(() => value), () => {
            value = data();
        });
    } else {
        return render(data);
    }
}