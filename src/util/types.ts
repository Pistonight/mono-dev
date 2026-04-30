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
    /** Additional modules to be externalized */
    external?: string[];
    /** undefined = true */
    sourcemap?: boolean | "inline" | "hidden";
    /** undefined = true, set to false to disable zapping "imports" field in package.json */
    importmap?: false; // generate subpath imports
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
