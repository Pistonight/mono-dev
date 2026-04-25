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
//# sourceMappingURL=location.d.ts.map