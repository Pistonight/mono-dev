
const INDENT = 4;

export const stringifySorted = (value: unknown): string | undefined => {
    return stringifySortedIndent(value, 0);
};

export const stringifySortedIndent = (value: unknown, indent: number): string | undefined => {
    if (value === null || value === undefined) {
        return "null";
    }
    switch (typeof value) {
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
                    const inner = stringifySortedIndent(value[0], indent);
                    if (inner !== undefined) {
                        return `[ ${inner} ]`;
                    }
                    return "[]";
                }
                let output = "[\n";
                let has_value = false;
                const prefix = " ".repeat(indent);
                for (let i = 0; i < value.length; i++) {
                    const inner = stringifySortedIndent(value[i], indent + INDENT);
                    if (inner === undefined) {
                        continue;
                    }
                    if (has_value) {
                        output += ",\n";
                    }
                    has_value = true;
                    output += prefix;
                    output += " ".repeat(INDENT);
                    output += inner;
                }
                output += "\n";
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
    let has_value = false;
    for (let i = 0; i < keys.length; i++) {
        const inner = stringifySortedIndent((value as Record<string, unknown>)[keys[i]], indent + INDENT);
        if (inner === undefined) {
            continue;
        }
        if (has_value) {
            output += ",\n";
        }
        has_value = true;
        output += prefix;
        output += " ".repeat(INDENT);
        output += JSON.stringify(keys[i]);
        output += ": ";
        output += inner;
    }
    output += "\n";
    output += prefix;
    output += "}";
    return output;
};
