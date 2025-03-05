import fs from "fs";
import path from "path";
import vitePluginReact from "@vitejs/plugin-react";
import vitePluginTsConfigPaths from "vite-tsconfig-paths";
import vitePluginYaml from "@modyfi/vite-plugin-yaml";
import vitePluginWasm from "vite-plugin-wasm";

// 2025-03-01: Support top level await natively
const BuildTargets = ["es2022", "edge89", "chrome89", "firefox89", "safari15"];
const ChunkSizeWarningLimit = 4096;
const ManualChunks = {
    react: ["react", "react-dom", "@fluentui/react-components"],
};
const Dedupe = ["@pistonite/pure"];

const PackageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));

const filterDependencies = (input) => {
    const dependencies = PackageJson.dependencies || {};
    const devDependencies = PackageJson.devDependencies || {};
    return input.filter(
        (dependency) => dependencies[dependency] || devDependencies[dependency],
    );
};

const findHttps = () => {
    const findHttpsFromDirectory = (directory) => {
        try {
            const key = path.join(directory, ".cert", "cert.key");
            const cert = path.join(directory, ".cert", "cert.pem");
            if (fs.existsSync(key) && fs.existsSync(cert)) {
                console.log(
                    `[mono-dev] using HTTPS key and cert from "${directory}"`,
                );
                return { key, cert };
            }
        } catch {
            // ignore
        }
        return undefined;
    };
    let config = findHttpsFromDirectory(".");
    if (config) {
        return config;
    }
    config = findHttpsFromDirectory("..");
    if (config) {
        return config;
    }
    config = findHttpsFromDirectory("../..");
    if (config) {
        return config;
    }
    console.warn("[mono-dev] HTTPS key and cert not found, not using HTTPS.");
    return undefined;
};

export default function monodev(monoConfig) {
    return (config) => {
        console.log("[mono-dev] injecting mono-dev configuration");
        // === Plugins ===
        const makePlugins = () => {
            const plugins = [];
            plugins.push(vitePluginTsConfigPaths());
            plugins.push(vitePluginYaml());
            if (monoConfig.react) {
                plugins.push(vitePluginReact());
            }
            if (monoConfig.wasm) {
                plugins.push(vitePluginWasm());
            }
            return plugins;
        };
        if (!config.plugins) {
            config.plugins = [];
        }
        config.plugins.push(...makePlugins());

        // === Worker Plugins ===
        if ("worker" in monoConfig) {
            if (!config.worker) {
                config.worker = {};
            }
            const originWorkerPlugins = config.worker.plugins;
            config.worker.plugins = () => {
                const plugins = originWorkerPlugins
                    ? originWorkerPlugins()
                    : [];
                plugins.push(...makePlugins());
                return plugins;
            };
            if (monoConfig.worker !== "default") {
                config.worker.format = monoConfig.worker;
            }
        }

        // === Package Dependencies ===
        if (!config.resolve) {
            config.resolve = {};
        }
        if (!config.resolve.dedupe) {
            config.resolve.dedupe = [];
        }
        for (const packageToDedupe of filterDependencies(Dedupe)) {
            config.resolve.dedupe.push(packageToDedupe);
        }

        // === Build Config ===
        if (!config.build) {
            config.build = {};
        }
        if (config.build.target) {
            console.warn(
                "[mono-dev] not injecting build target because it is already specified",
            );
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
        if (!config.build.rollupOptions) {
            config.build.rollupOptions = {};
        }
        if (!config.build.manualChunks) {
            config.build.manualChunks = {};
        } else if (typeof config.build.manualChunks === "function") {
            console.warn(
                "[mono-dev] not injecting manual chunks because a function is specified.",
            );
        } else {
            for (const key in ManualChunks) {
                if (config.build.manualChunks[key]) {
                    console.warn(
                        `[mono-dev] not injecting manual chunk ${key} because it is already specified`,
                    );
                } else {
                    config.build.manualChunks[key] = ManualChunks[key];
                }
            }
        }

        // === Server Config ===
        if (!config.server) {
            config.server = {};
        }
        if (monoConfig.https) {
            if (config.server.https) {
                console.warn(
                    "[mono-dev] not searching for HTTPS config because it is already specified",
                );
            } else {
                const httpsConfig = findHttps();
                config.server.https = httpsConfig;
            }
        }

        return config;
    };
}
