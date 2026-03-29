export type PackageJson = {
    exports?: Record<string, string>,
    dependencies?: Record<string, string>,
    devDependencies?: Record<string, string>,
    peerDependencies?: Record<string, string>,
    optionalDependencies?: Record<string, string>,
    bundledDependencies?: Record<string, string>,
}
