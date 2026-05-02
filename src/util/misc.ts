import fs from "node:fs";
import path from "node:path";

export interface PackageJson {
    private?: true;
    version?: string;
    files?: string[];
    types?: string;
    exports?: string | Record<string, string | PackageExport>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
    bundledDependencies?: Record<string, string>;
    ["pistonight/mono-dev"]?: MonoDevOptions;
    imports?: Record<string, string>;
}

export interface PackageExport {
    types?: string;
    import?: string;
}

export interface MonoDevOptions {
    /** path patterns to skip TS/prettier/eslint check */
    nocheck?: string[];
    /** exports to skip compiling and export the raw TS file */
    nocompile?: string[];
    /** additional exports to compile, the corresponding key in 'exports' should have import and type */
    compile?: Record<string, string>;
    /** Use tsc instead of tsgo - for 6->7 transition if something breaks. Default tsgo will be used */
    tsc?: boolean;
    /** Allow publishing (default false) */
    publish?: boolean;
    /** if lib mode should be used, which adds more rules to eslint. default is true */
    lib?: boolean;
    /** Skip emitting .d.ts files when building library */
    nodts?: boolean;
    /** undefined = true */
    sourcemap?: boolean | "inline" | "hidden";
    /** undefined = true, set to false to disable zapping "imports" field in package.json */
    importmap?: false; // generate subpath imports
    /** should jsdom be used in test environments */
    jsdom?: boolean;
    /**
     * When running vite dev server,
     * look for .cert/cert.key and .cert/cert.pem 2 levels
     * up from the current directory (including the current directory),
     * and use them to configure HTTPS for the dev server.
     *
     * undefined = false
     */
    https?: boolean;
    /** Load the WASM plugin */
    wasm?: boolean;

    /**
     * Worker format
     *
     * - unspecified: no plugin config will be set for worker
     * - "default": set the same plugins for worker, and don't set the format
     * - other: set the same plugins for worker, and set the format to the value
     */
    worker?: "default" | "es";

    /** Define import.meta.env values */
    ["import.meta.env"]?: {
        /**
         * VERSION pointing to version field in package.json.
         * Can also be a relative path pointing to another package.json
         */
        VERSION?: boolean | string;
        /** COMMIT by running git rev-parse HEAD */
        COMMIT?: boolean;
    };
}

export interface LibExportConfig {
    exports: ParsedExport[];
}

export interface ParsedExport {
    /** If the export key is '.' then this is '.', other wise the part without ./ */
    entryName: string;
    /** absolute path of the source file */
    sourcePathAbs: string;
    /** dist relative path without the ./dist/ */
    distPathRel: string;
    /** dist dts relative path without the ./dist/ */
    distDtsPathRel: string;
}

/** The prefix for type definition directory */
export const DTS = "_dts_";

/** The source directory when compilong libraries */
export const SRC = "src";

/** The output directory for transpiled/bundled JS code */
export const DIST = "dist";

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
    return import.meta.env.VERSION;
};

export interface ProjectLocation {
    packageJsonPath: string;
    rootDir: string;
    cacheDir: string;
}

/**
 * Filter to dependencies inside package.json
 */
export const filterDependencies = (packageJson: PackageJson, toFilter: string[]): string[] => {
    return toFilter.filter((d) => hasDependency(packageJson, d));
};

export const hasDependency = (packageJson: PackageJson, dep: string) => {
    if (packageJson.dependencies && dep in packageJson.dependencies) {
        return true;
    }
    if (packageJson.devDependencies && dep in packageJson.devDependencies) {
        return true;
    }
    if (packageJson.peerDependencies && dep in packageJson.peerDependencies) {
        return true;
    }
    if (packageJson.optionalDependencies && dep in packageJson.optionalDependencies) {
        return true;
    }
    if (packageJson.bundledDependencies && dep in packageJson.bundledDependencies) {
        return true;
    }
    return false;
};

const PREFIX = "[mono]";
export const logInfo = (...args: unknown[]) => console.log(PREFIX, ...args);
export const logWarn = (...args: unknown[]) =>
    console.warn("\x1b[33m" + PREFIX, ...args, "\x1b[0m");
export const logError = (...args: unknown[]) =>
    console.error("\x1b[31m" + PREFIX, ...args, "\x1b[0m");

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
