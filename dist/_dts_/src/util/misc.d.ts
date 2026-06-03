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
    /**
     * if lib mode should be used, which adds more rules to eslint.
     * default is true.
     *
     * `true` only allows portable library which does not depend on runtime-specific APIs
     * (node:* ones). Use "node" to automatically externalize node:* modules
     */
    lib?: boolean | "node";
    /** Skip emitting .d.ts files when building library */
    nodts?: boolean;
    /** undefined = true */
    sourcemap?: boolean | "inline" | "hidden";
    /** undefined = true, set to false to disable zapping "imports" field in package.json */
    importmap?: false;
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
export declare const DTS = "_dts_";
/** The source directory when compilong libraries */
export declare const SRC = "src";
/** The output directory for transpiled/bundled JS code */
export declare const DIST = "dist";
export declare const MONO_DEV_PATH: string;
export declare const MONO_DEV_BIN_PATH: string;
export declare const getProjectLocations: () => ProjectLocation;
export declare const getProjectPackageJsonPath: () => string;
export declare const getMonodevVersion: () => string;
export interface ProjectLocation {
    packageJsonPath: string;
    rootDir: string;
    cacheDir: string;
}
/**
 * Filter to dependencies inside package.json
 */
export declare const filterDependencies: (packageJson: PackageJson, toFilter: string[]) => string[];
export declare const hasDependency: (packageJson: PackageJson, dep: string) => boolean;
export declare const logInfo: (...args: unknown[]) => void;
export declare const logWarn: (...args: unknown[]) => void;
export declare const logError: (...args: unknown[]) => void;
export declare const normalizeLineEnds: (content: string) => string;
export declare const splitOnce: (input: string, sep: string) => [string, string | undefined];
//# sourceMappingURL=misc.d.ts.map