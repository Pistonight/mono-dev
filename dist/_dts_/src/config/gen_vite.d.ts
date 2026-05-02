import type { Plugin, UserConfig } from "vite";
import { type MonoDevOptions, type PackageJson } from "#util";
export declare const KNOWN_PROBLEMATIC_ESM_COMPAT_MODULES_AND_THEIR_IMPORTERS: string[];
export declare const KNOWN_GLOBAL_SINGLETON_PACKAGES: string[];
/** Write the vite-gen.config.js file if rootDir does not already have a vite.config.(j|t)s */
export declare const resolveViteLibConfig: (cacheDir: string, rootDir: string) => string | undefined;
export declare const genVitePlugins: (packageJson: PackageJson) => Plugin[];
export declare const genViteDefines: (packageJson: PackageJson, packageJsonPath: string) => Record<string, string>;
export declare const genViteBuildConfig: (config: UserConfig, monodevOptions: MonoDevOptions) => Exclude<UserConfig["build"], undefined>;
export declare const genVitest: (config: UserConfig, monodevOptions: MonoDevOptions) => Exclude<UserConfig["test"], undefined>;
//# sourceMappingURL=gen_vite.d.ts.map