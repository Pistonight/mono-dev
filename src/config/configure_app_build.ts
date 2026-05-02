import fs from "node:fs";
import path from "node:path";

import type { ConfigEnv, UserConfig, UserConfigFnPromise } from "vite";
import { defineConfig } from "vite";
import type { OutputOptions as RolldownOutputOptions } from "rolldown";

import {
    filterDependencies,
    getProjectPackageJsonPath,
    logInfo,
    logWarn,
    type PackageJson,
} from "#util";

import {
    genViteBuildConfig,
    genViteDefines,
    genVitePlugins,
    genVitest,
    KNOWN_GLOBAL_SINGLETON_PACKAGES,
} from "./gen_vite.ts";

// TODO: see how default splitting behaves
// const ManualChunks = {
//     react: ["react", "react-dom", "@fluentui/react-components"],
// };

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

    logInfo("injecting app-build configuration to vite");
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

    // === Worker ===
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

    // === Package Dependencies ===
    if (!config.resolve) {
        config.resolve = {};
    }
    if (!config.resolve.dedupe) {
        config.resolve.dedupe = [];
    }
    for (const p of filterDependencies(packageJson, KNOWN_GLOBAL_SINGLETON_PACKAGES)) {
        config.resolve.dedupe.push(p);
    }

    const _build = genViteBuildConfig(config, monodevOptions);

    // === Build Config ===
    // if (!build.rolldownOptions) {
    //     build.rolldownOptions = {};
    // }
    // if (!build.rolldownOptions.output) {
    //     build.rolldownOptions.output = {};
    // }
    // const cbrOutput = build.rolldownOptions.output;
    // if (Array.isArray(cbrOutput)) {
    //     for (let i = 0; i < cbrOutput.length; i++) {
    //         cbrOutput[i] = transformRolldownOutputOption(cbrOutput[i]);
    //     }
    // } else {
    //     build.rolldownOptions.output = transformRolldownOutputOption(cbrOutput);
    // }

    // === Server Config ===
    const enableHttps = monodevOptions.https && env.command === "serve" && !process.env.VITEST;
    if (enableHttps) {
        if (!config.server) {
            config.server = {};
        }
        const https = findHttps();
        if (https) {
            if (!config.server.https) {
                config.server.https = {};
            }
            const { key, cert, hostname } = https;
            config.server.https.key = key;
            config.server.https.cert = cert;
            if (hostname) {
                // override the host from config.server to use the hostname in the https
                // config
                if (config.server.host !== hostname) {
                    logWarn("overriding server.host to " + hostname);
                    config.server.host = hostname;
                }
            }
            if (config.server.hmr !== false) {
                if (!config.server.hmr || typeof config.server.hmr === "boolean") {
                    config.server.hmr = {};
                }
                if (hostname) {
                    if (config.server.hmr.host !== hostname) {
                        logWarn("overriding server.hmr.host to " + hostname);
                        config.server.hmr.host = hostname;
                    }
                }
                // when using https, must specify protocol as wss
                // for connection to work
                config.server.hmr.protocol = "wss";
            }
        }
    }

    // === Test Config ===
    genVitest(config, monodevOptions);

    return config;
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

const _transformRolldownOutputOption = (output: RolldownOutputOptions): RolldownOutputOptions => {
    // if (!output.codeSplitting) {
    //     output.codeSplitting = {};
    // }
    // TODO: check how code is splitted
    return output;
};
