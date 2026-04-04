import fs from "node:fs";
import path from "node:path";
import vitePluginReact, { reactCompilerPreset as viteBabelReactCompilerPreset } from "@vitejs/plugin-react";
import vitePluginBabel from "@rolldown/plugin-babel";
import vitePluginYaml from "@modyfi/vite-plugin-yaml";
import vitePluginWasm from "vite-plugin-wasm";
import { has_dependency } from "./util.js";

// 2025-03-01: Support top level await natively
const BuildTargets = ["es2022", "edge89", "chrome89", "firefox89", "safari15"];
const ChunkSizeWarningLimit = 4096;
// const ManualChunks = {
//     react: ["react", "react-dom", "@fluentui/react-components"],
// };
const Dedupe = ["@pistonite/pure", "@pistonite/workex", "i18next", "react-i18next"];




/**
 * @param {import("./vite_config.d.ts").MonodevViteConfig} mono_config
 */
const monodev = (mono_config) => {
    /** @param {import("vite").UserConfig} config */
    return (config) => {
        console.log("[mono-dev] injecting mono-dev configuration");
        // === Plugins ===
        if (!config.plugins) {
            config.plugins = [];
        }
        config.plugins.push(...make_plugins(mono_config));

        // === Worker Plugins ===
        if ("worker" in mono_config) {
            if (!config.worker) {
                config.worker = {};
            }
            const original = config.worker.plugins;
            config.worker.plugins = () => {
                const plugins = original ? original() : [];
                plugins.push(...make_plugins(mono_config));
                return plugins;
            };
            if (mono_config.worker !== "default") {
                config.worker.format = mono_config.worker;
            }
        }

        // === Defines ===
        if (!config.define) {
            config.define = {};
        }
        if (!("import.meta.vitest" in config.define)) {
            config.define["import.meta.vitest"] = "undefined";
        }

        // === Package Dependencies ===
        if (!config.resolve) {
            config.resolve = {};
        }
        if (!config.resolve.dedupe) {
            config.resolve.dedupe = [];
        }
        const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
        for (const packageToDedupe of filterDependencies(packageJson, Dedupe)) {
            config.resolve.dedupe.push(packageToDedupe);
        }

        // === Build Config ===
        if (!config.build) {
            config.build = {};
        }
        if (config.build.target) {
            console.warn("[mono-dev] not injecting build target because it is already specified");
        } else {
            config.build.target = BuildTargets;
        }
        if (config.build.chunkSizeWarningLimit) {
            console.warn(
                "[mono-dev] not injecting chunk size warning limit because it is already specified",
            );
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
        if (!config.server) {
            config.server = {};
        }
        if (mono_config.https) {
            if (config.server.https) {
                console.warn(
                    "[mono-dev] not searching for HTTPS config because it is already specified",
                );
            } else {
                const https = find_https();
                if (https) {
                    const { key, cert, hostname } = https;
                    config.server.https = { key, cert };
                    if (hostname) {
                        if (config.server.host) {
                            console.warn(
                                `[mono-dev] not setting server.host to because it is already specified`,
                            );
                        } else {
                            config.server.host = hostname;
                        }
                    }
                    if (config.server.hmr) {
                        const hmrConfig = {
                            host: hostname,
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
}
;
export default monodev;

/**
 * @param {import("./vite_config.d.ts").MonodevViteConfig} mono_config
 */
const make_plugins = (mono_config) => {
    const plugins = [];
    plugins.push(vitePluginTsConfigPaths());
    plugins.push(vitePluginYaml());
    plugins.push(vitePluginReact());
    plugins.push(vitePluginBabel({
        presets: [viteBabelReactCompilerPreset()]
    }));
    if (mono_config.wasm) {
        plugins.push(vitePluginWasm());
    }
    return plugins;
};

/**
 * Filter to dependencies inside package.json
 *
 * @param {import("./types.ts").PackageJson} package_json
 * @param {string[]} to_filter
 */
const filterDependencies = (package_json, to_filter) => {
    return to_filter.filter((d) => has_dependency(package_json, d));
};

const find_https = () => {
    /**
     * @param {string} directory
     */
    const find_https_from_directory = (directory) => {
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
                console.warn(`[mono-dev] failed to read cert.pem: ${e}`);
            }
            console.log(`[mono-dev] using HTTPS key and cert from "${directory}"`);
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
    console.warn("[mono-dev] HTTPS key and cert not found, not using HTTPS.");
    return undefined;
};

/**
 * @param {import("rolldown").OutputOptions} output
 * @return {import("rolldown").OutputOptions}
 */
const transformRolldownOutputOption = (output) => {
    if (output.manualChunks) {
        console.warn("[mono-dev] not injecting code splitting because 'manualChunks' is specified");
        return output;
    }
    if ("codeSplitting" in output && typeof output.codeSplitting !== "object") {
        console.warn("[mono-dev] not injecting code splitting because 'codeSplitting' is specified and not an object");
        return output;
    }
    // if (!output.codeSplitting) {
    //     output.codeSplitting = {};
    // }
    // TODO: check how code is splitted
    return output;
}
