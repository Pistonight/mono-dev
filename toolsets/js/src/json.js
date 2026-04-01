const INDENT = 4;

/** @param {any} value */
export const stringify_sorted = (value) => {
    return stringify_sorted_indented(value, 0);
}

/**
 * @param {any} value
 * @param {number} indent
 */
export const stringify_sorted_indented = (value, indent) => {
    if (value === null || value === undefined) {
        return "null";
    }
    switch(typeof value) {
        case "string":
        case "number":
        case "boolean":
            return JSON.stringify(value);
        case "object": {
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    return "[]";
                }
                if (value.length === 1) {
                    const inner = stringify_sorted_indented(value[0], indent);
                    if (inner !== undefined) {
                        return `[ ${inner} ]`;
                    }
                    return "[]";
                }
                let output = "[\n";
                const prefix = " ".repeat(indent);
                for (let i = 0;i<value.length;i++) {
                    const inner = stringify_sorted_indented(value[i], indent + INDENT);
                    if (inner === undefined) {
                        continue;
                    }
                    output += prefix;
                    output += " ".repeat(INDENT);
                    output += inner;
                    if (i !== value.length - 1) {
                        output += ",\n";
                    } else {
                        output += "\n";
                    }
                }
                output += prefix;
                output += "]";
                return output;
            }
            break;
        }
        default:
            return undefined;
    }
    const keys = Object.keys(value).sort();
    if (keys.length === 0) {
        return "{}";
    }
    let output = "{\n";
    const prefix = " ".repeat(indent);
    for (let i = 0;i<keys.length;i++) {
        const inner = stringify_sorted_indented(value[keys[i]], indent + INDENT);
        if (inner === undefined) {
            continue;
        }
        output += prefix;
        output += " ".repeat(INDENT);
        output += JSON.stringify(keys[i]);
        output += ": ";
        output += inner;
        if (i !== value.length - 1) {
            output += ",\n";
        } else {
            output += "\n";
        }
    }
    output += prefix;
    output += "}";
    return output;
}
