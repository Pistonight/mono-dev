import path from "node:path";
import fs from "node:fs";

import type { ConfigEnv, UserConfig, UserConfigFnPromise } from "vite";
import { defineConfig } from "vite";

import { getProjectPackageJsonPath, logError, logInfo, logWarn, type PackageJson } from "#util";
import { parseExports } from "#project";

import { genViteBuildConfig, genViteDefines, genVitePlugins } from "./gen_vite.ts";

export const configure = async (
    config:
        | UserConfig
        | Promise<UserConfig>
        | ((env: ConfigEnv) => UserConfig | Promise<UserConfig>),
): Promise<UserConfig | UserConfigFnPromise> => {
    const configA = await config;
    if (typeof configA === "function") {
        return defineConfig(async (env) => {
            const innerConfig = await configA(env);
            return patchUserConfigWithMonodev(env, innerConfig);
        });
    }
    return defineConfig(async (env) => patchUserConfigWithMonodev(env, configA));
};

export const patchUserConfigWithMonodev = (_env: ConfigEnv, config: UserConfig) => {
    const packageJsonPath = getProjectPackageJsonPath();
    const rootDir = path.dirname(packageJsonPath);
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const monodevOptions = packageJson["pistonight/mono-dev"] || {};

    logInfo("injecting lib-build configuration to vite");
    // === Plugins ===
    if (!config.plugins) {
        config.plugins = genVitePlugins(packageJson);
    } else {
        config.plugins.push(...genVitePlugins(packageJson));
    }

    // === Defines ===
    if (!config.define) {
        config.define = genViteDefines(packageJson, packageJsonPath);
    } else {
        config.define = {
            ...genViteDefines(packageJson, packageJsonPath),
            ...config.define,
        };
    }

    const build = genViteBuildConfig(config, monodevOptions);
    // === Exports (Entry) ===
    const libExports = parseExports(rootDir, packageJson);
    if ("err" in libExports) {
        logError("failed to parse exports: " + libExports.err);
        process.exit(1);
    }
    const { exports } = libExports.val;
    const entryConfig = Object.fromEntries(
        exports.map(({ entryName: n, sourcePathAbs }) => {
            return [n === "." ? "index" : n, sourcePathAbs];
        }),
    );
    const fileNameConfig = Object.fromEntries(
        exports.map(({ entryName: n, distPathRel }) => {
            return [n === "." ? "index" : n, distPathRel];
        }),
    );

    if (!build.lib) {
        build.lib = {
            entry: entryConfig,
        };
    } else {
        if ("entry" in build.lib) {
            logError(
                "build.lib.entry must NOT be specified in vite; it is automatically determined based on exports",
            );
            process.exit(1);
        }
    }
    if ("fileName" in build.lib) {
        logError(
            "build.lib.fileName must NOT be specified in vite; it is automatically determined based on exports",
        );
        process.exit(1);
    }
    build.lib.fileName = (_format, entryName) => {
        if (!(entryName in fileNameConfig)) {
            throw new Error("unexpected unknown entry point: " + entryName);
        }
        return fileNameConfig[entryName];
    };
    if (!build.lib.formats) {
        build.lib.formats = ["es"];
    }

    // === Externalization ===
    const externalDeps = new Set<string>();
    if (packageJson.dependencies) {
        for (const dep in packageJson.dependencies) {
            externalDeps.add(dep);
        }
    }
    if (packageJson.peerDependencies) {
        for (const dep in packageJson.peerDependencies) {
            externalDeps.add(dep);
        }
    }
    if (packageJson.optionalDependencies) {
        for (const dep in packageJson.optionalDependencies) {
            externalDeps.add(dep);
        }
    }
    const externals: (string | RegExp)[] = Array.from(externalDeps);
    // also include <package>/* exports
    for (const dep of externalDeps) {
        externals.push(new RegExp("^" + dep + "/"));
    }

    if (!build.rolldownOptions) {
        build.rolldownOptions = {};
    }
    if (typeof build.rolldownOptions.external === "function") {
        logWarn("build.rolldownOptions.external is a function which is REALLY BAD for perf");
        const original = build.rolldownOptions.external;
        build.rolldownOptions.external = (id, parentId, isResolved) => {
            for (const e of externals) {
                if (typeof e === "string") {
                    if (e === id) {
                        return true;
                    }
                } else {
                    if (id.match(e)) {
                        return true;
                    }
                }
            }
            return original(id, parentId, isResolved);
        };
    } else if (Array.isArray(build.rolldownOptions.external)) {
        build.rolldownOptions.external.push(...externals);
    } else if (build.rolldownOptions.external) {
        build.rolldownOptions.external = [build.rolldownOptions.external, ...externals];
    } else {
        build.rolldownOptions.external = externals;
    }

    return config;
};
