import fs from "node:fs";
import path from "node:path";

const DIRNAME = import.meta.dirname;

// compute dynamically based on if we are being executed from src or dist
export const MONO_DEV_PATH =
    path.basename(DIRNAME) === "dist" ? path.dirname(DIRNAME) : path.dirname(path.dirname(DIRNAME));
export const MONO_DEV_BIN_PATH = path.join(MONO_DEV_PATH, "node_modules", ".bin");

export const getProjectLocations = (): ProjectLocation => {
    const packageJsonPath = getProjectPackageJsonPath();
    const rootDir = path.dirname(packageJsonPath);
    const cacheDir = path.join(rootDir, "node_modules/.mono");
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }
    return {
        packageJsonPath,
        rootDir,
        cacheDir,
    };
};

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

export interface ProjectLocation {
    packageJsonPath: string;
    rootDir: string;
    cacheDir: string;
}
