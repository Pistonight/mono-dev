
export const normalizeLineEnds = (content: string) => {
    return content
        .split("\r")
        .map((x) => x.trimEnd())
        .join("\n");
};

export const splitOnce = (input: string, sep: string): [string, string | undefined] => {
    const i = input.indexOf(sep);
    if (i === -1) {
        return [input, undefined];
    }
    return [input.substring(0, i), input.substring(i + 1)];
};
