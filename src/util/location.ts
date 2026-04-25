import fs from "node:fs";
import path from "node:path";

// we are at mono-dev/src/util
export const MONO_DEV_PATH = path.dirname(path.dirname(import.meta.dirname));
export const MONO_DEV_BIN_PATH = path.join(MONO_DEV_PATH, "node_modules", ".bin");
export const getProjectPackageJsonPath = (): string => {
    let curr = path.resolve(".");
    let currJson = path.join(curr, "package.json");
    while (!fs.existsSync(currJson)) {
        const nextCurr = path.dirname(curr);
        if (!nextCurr || nextCurr === curr) {
            return "package.json"; // no package.json found, assuming current directory
        }
        curr = nextCurr;
        currJson = path.join(curr, "package.json");
    }
    return path.resolve(currJson);
};
export const getMonodevVersion = (): string => {
    return import.meta.version;
};
