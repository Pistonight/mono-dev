export type PackageJson = {
    files?: string[],
    types?: string,
    exports?: string | Record<string, string | PackageExport>,
    dependencies?: Record<string, string>,
    devDependencies?: Record<string, string>,
    peerDependencies?: Record<string, string>,
    optionalDependencies?: Record<string, string>,
    bundledDependencies?: Record<string, string>,
    nocheck?: string[],
    tsconfig?: any,
}

export type PackageExport = {
    types?: string,
    "import"?: string,
}

export type ParsedExport = {
    entry_name: string,
    source_path_abs: string,
    dist_path_rel: string,
}

export type LibExport = {
    dist: string,
    src: string,
    exports: ParsedExport[],
}
