import fs from "node:fs";
import path from "node:path";

import type { ConfigEnv, UserConfig, UserConfigFnPromise } from "vite";
import { defineConfig } from "vite";
import type { OutputOptions as RolldownOutputOptions } from "rolldown";

import {
    getProjectPackageJsonPath,
    hasDependency,
    logInfo,
    logWarn,
    type PackageJson,
} from "#util";

import { genViteDefines, genVitePlugins } from "./gen_vite.ts";

const ChunkSizeWarningLimit = 4096;
// TODO: see how default splitting behaves
// const ManualChunks = {
//     react: ["react", "react-dom", "@fluentui/react-components"],
// };
const Dedupe = [
    "react",
    "react-dom",
    "@fluentui/react-components",
    "@fluentui/react-icons",
    "@pistonite/pure",
    "@pistonite/celera",
    "@pistonite/workex",
    "i18next",
    "react-i18next",
];

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

const patchUserConfigWithMonodev = (env: ConfigEnv, config: UserConfig): UserConfig => {
    const packageJsonPath = getProjectPackageJsonPath();
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const monodevOptions = packageJson["pistonight/mono-dev"] || {};

    logInfo("injecting mono-dev configuration");
    // === Plugins ===
    if (!config.plugins) {
        config.plugins = [];
    }

    config.plugins.push(...genVitePlugins(packageJson));

    // === Worker Plugins ===
    if ("worker" in monodevOptions) {
        if (!config.worker) {
            config.worker = {};
        }
        const original = config.worker.plugins;
        config.worker.plugins = () => {
            const plugins = original ? original() : [];
            plugins.push(...genVitePlugins(packageJson));
            return plugins;
        };
        if (monodevOptions.worker !== "default") {
            config.worker.format = monodevOptions.worker;
        }
    }

    // === Defines ===
    if (!config.define) {
        config.define = {};
    }
    config.define = {
        ...genViteDefines(packageJson),
        "import.meta.vitest": "undefined",
        ...config.define,
    };

    // === Package Dependencies ===
    if (!config.resolve) {
        config.resolve = {};
    }
    if (!config.resolve.dedupe) {
        config.resolve.dedupe = [];
    }
    for (const packageToDedupe of filterDependencies(packageJson, Dedupe)) {
        config.resolve.dedupe.push(packageToDedupe);
    }

    // === Build Config ===
    const sourcemapOption = "sourcemap" in monodevOptions ? monodevOptions.sourcemap : true;
    if (!config.build) {
        config.build = {};
    }
    if (!("sourcemap" in config.build)) {
        config.build.sourcemap = sourcemapOption;
    } else {
        logWarn("not setting sourcemap option because it is already specified");
    }
    if (config.build.chunkSizeWarningLimit) {
        logWarn("not setting chunk size warning limit because it is already specified");
    } else {
        config.build.chunkSizeWarningLimit = ChunkSizeWarningLimit;
    }
    if (!config.build.rolldownOptions) {
        config.build.rolldownOptions = {};
    }
    if (!config.build.rolldownOptions.output) {
        config.build.rolldownOptions.output = {};
    }
    const cbrOutput = config.build.rolldownOptions.output;
    if (Array.isArray(cbrOutput)) {
        for (let i = 0; i < cbrOutput.length; i++) {
            cbrOutput[i] = transformRolldownOutputOption(cbrOutput[i]);
        }
    } else {
        config.build.rolldownOptions.output = transformRolldownOutputOption(cbrOutput);
    }

    // === Server Config ===
    const enableHttps = monodevOptions.https && env.command === "serve";
    if (!config.server) {
        config.server = {};
    }
    if (enableHttps) {
        if (config.server.https) {
            logWarn("not searching for HTTPS config because it is already specified");
        } else {
            const https = findHttps();
            if (https) {
                const { key, cert, hostname } = https;
                config.server.https = { key, cert };
                if (hostname) {
                    if (config.server.host) {
                        logWarn(`not setting server.host to because it is already specified`);
                    } else {
                        config.server.host = hostname;
                    }
                }
                if (config.server.hmr) {
                    const hmrConfig = {
                        host: hostname,
                        protocol: "wss",
                    };
                    if (typeof config.server.hmr === "boolean") {
                        config.server.hmr = hmrConfig;
                    } else {
                        config.server.hmr = {
                            ...config.server.hmr,
                            ...hmrConfig,
                        };
                    }
                }
            }
        }
    }

    return config;
};
/**
 * Filter to dependencies inside package.json
 */
const filterDependencies = (packageJson: PackageJson, to_filter: string[]) => {
    return to_filter.filter((d) => hasDependency(packageJson, d));
};

const findHttps = () => {
    const find_https_from_directory = (directory: string) => {
        try {
            const key = path.join(directory, ".cert", "cert.key");
            const cert = path.join(directory, ".cert", "cert.pem");
            if (!fs.existsSync(key) || !fs.existsSync(cert)) {
                return undefined;
            }
            // read the subject name (host name)
            let hostname = "";
            try {
                const pemFile = fs.readFileSync(cert, "utf-8");
                for (const line of pemFile.split("\n")) {
                    const l = line.trim();
                    if (l.toLowerCase().startsWith("subject=")) {
                        const subject = l.substring("subject=".length);
                        for (const part of subject.split(",")) {
                            const [key, value] = part.split("=");
                            if (key.trim().toLowerCase() === "cn") {
                                hostname = value.trim();
                                break;
                            }
                        }
                        break;
                    }
                }
            } catch (e) {
                logWarn(`failed to read cert.pem: ${e}`);
            }
            logInfo(`using HTTPS key and cert from "${directory}"`);
            return { key, cert, hostname };
        } catch {
            // ignore
        }
        return undefined;
    };
    let config = find_https_from_directory(".");
    if (config) {
        return config;
    }
    config = find_https_from_directory("..");
    if (config) {
        return config;
    }
    config = find_https_from_directory("../..");
    if (config) {
        return config;
    }
    logWarn("HTTPS key and cert not found, not using HTTPS.");
    return undefined;
};

const transformRolldownOutputOption = (output: RolldownOutputOptions): RolldownOutputOptions => {
    // if (!output.codeSplitting) {
    //     output.codeSplitting = {};
    // }
    // TODO: check how code is splitted
    return output;
};
