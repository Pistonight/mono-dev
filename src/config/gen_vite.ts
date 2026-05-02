import path from "node:path";
import fs from "node:fs";
import child_process from "node:child_process";

import vitePluginReact, {
    reactCompilerPreset as viteBabelReactCompilerPreset,
} from "@vitejs/plugin-react";
import vitePluginBabel from "@rolldown/plugin-babel";
import babelReactCompiler from "babel-plugin-react-compiler";
import vitePluginWasm from "vite-plugin-wasm";
import type { Plugin, UserConfig } from "vite";

import { viteYaml } from "#plugins";
import {
    hasDependency,
    logError,
    logInfo,
    logWarn,
    type MonoDevOptions,
    SRC,
    type PackageJson,
} from "#util";

const CHUNK_SIZE_WARNING_LIMIT = 4096;

export const KNOWN_PROBLEMATIC_ESM_COMPAT_MODULES_AND_THEIR_IMPORTERS = [
    "@fluentui/react-components",
    "@fluentui/react-icons",
    "@pistonite/celera",
];

export const KNOWN_GLOBAL_SINGLETON_PACKAGES = [
    "react",
    "react-dom",
    "@pistonite/celera",
    "i18next",
    "react-i18next",
    // not global singleton but should be treated as so
    // to dedupe anyway
    "@pistonite/pure",
    "@pistonite/workex",
];

/** Write the vite-gen.config.js file if rootDir does not already have a vite.config.(j|t)s */
export const resolveViteLibConfig = (cacheDir: string, rootDir: string): string | undefined => {
    // note we don't detect other extensions as they are unlikely
    const hasRootConfig =
        fs.existsSync(path.join(rootDir, "vite.config.ts")) ||
        fs.existsSync(path.join(rootDir, "vite.config.js"));
    if (hasRootConfig) {
        return undefined;
    }
    const viteGenConfigPath = path.join(cacheDir, "vite-gen.config.js");
    fs.writeFileSync(
        viteGenConfigPath,
        `import { configure } from "mono-dev/lib-build-config"; export default configure({});`,
    );
    return viteGenConfigPath;
};

export const genVitePlugins = (packageJson: PackageJson): Plugin[] => {
    const plugins = [];
    plugins.push(viteYaml());
    if (hasDependency(packageJson, "react")) {
        plugins.push(vitePluginReact());
        const reactCompilerPreset = viteBabelReactCompilerPreset();
        reactCompilerPreset.preset = () => {
            return {
                plugins: [[babelReactCompiler, {}]],
            };
        };

        plugins.push(
            vitePluginBabel({
                presets: [reactCompilerPreset],
            }),
        );
    }
    if (packageJson["pistonight/mono-dev"]?.wasm) {
        plugins.push(vitePluginWasm());
    }
    return plugins;
};

export const genViteDefines = (
    packageJson: PackageJson,
    packageJsonPath: string,
): Record<string, string> => {
    const importMetaEnvOptions = packageJson["pistonight/mono-dev"]?.["import.meta.env"] || {};
    const defines: Record<string, string> = {
        // vitest will delete this define, so it's fine to include it
        // unconditionally
        "import.meta.vitest": "false",
    };
    if (importMetaEnvOptions.VERSION) {
        if (typeof importMetaEnvOptions.VERSION === "string") {
            const resolvedPath = path.resolve(
                path.dirname(packageJsonPath),
                importMetaEnvOptions.VERSION,
            );
            let resolvedPackageJson: string;
            try {
                resolvedPackageJson = fs.readFileSync(resolvedPath, "utf-8");
            } catch {
                logError(`failed to resolve file for import.meta.env.VERSION: ${resolvedPath}`);
                process.exit(1);
            }
            let parsed: PackageJson;
            try {
                parsed = JSON.parse(resolvedPackageJson);
            } catch {
                logError(`failed to parse file for import.meta.env.VERSION: ${resolvedPath}`);
                process.exit(1);
            }
            const version = String(parsed.version);
            logInfo("import.meta.env.VERSION: " + version);
            defines.VERSION = version;
        } else {
            const version = String(packageJson.version);
            logInfo("import.meta.env.VERSION: " + version);
            defines.VERSION = version;
        }
    }

    if (importMetaEnvOptions.COMMIT) {
        const commit = child_process
            .spawnSync("git", ["rev-parse", "HEAD"], {
                encoding: "utf-8",
            })
            .stdout.trim();
        logInfo("import.meta.env.COMMIT: " + commit);
        defines.COMMIT = commit;
    }

    return defines;
};

export const genViteBuildConfig = (
    config: UserConfig,
    monodevOptions: MonoDevOptions,
): Exclude<UserConfig["build"], undefined> => {
    const sourcemapOption = "sourcemap" in monodevOptions ? monodevOptions.sourcemap : true;
    if (!config.build) {
        config.build = {};
    }
    if (!("sourcemap" in config.build)) {
        config.build.sourcemap = sourcemapOption;
    } else if ("sourcemap" in monodevOptions) {
        logWarn(
            "build.sourcemap is specified in both mono-dev and vite, consider removing one of them",
        );
        logWarn("using build.sourcemap as specified in vite config");
    }

    // default chunk size warning
    if (!config.build.chunkSizeWarningLimit) {
        config.build.chunkSizeWarningLimit = CHUNK_SIZE_WARNING_LIMIT;
    }

    return config.build;
};

export const genVitest = (
    config: UserConfig,
    monodevOptions: MonoDevOptions,
): Exclude<UserConfig["test"], undefined> => {
    if (!config.test) {
        config.test = {};
    }
    const inlineSource = SRC + "/**/*.{ts,mts,cts,tsx}";
    if (!config.test.includeSource) {
        config.test.includeSource = [inlineSource];
    } else {
        config.test.includeSource.push(inlineSource);
    }
    if (!config.test.server) {
        config.test.server = {};
    }
    if (!config.test.server.deps) {
        config.test.server.deps = {};
    }
    // if it's 'true' everything will be inlined, so skip injecting
    if (config.test.server.deps.inline !== true) {
        if (!config.test.server.deps.inline) {
            config.test.server.deps.inline =
                KNOWN_PROBLEMATIC_ESM_COMPAT_MODULES_AND_THEIR_IMPORTERS;
        } else {
            config.test.server.deps.inline.push(
                ...KNOWN_PROBLEMATIC_ESM_COMPAT_MODULES_AND_THEIR_IMPORTERS,
            );
        }
    }

    if (monodevOptions.jsdom) {
        if (config.test.environment) {
            logWarn(
                "test.environment is specified in vite and jsdom is specified in mono-dev, consider removing one of them",
            );
            logWarn("using test.environment as specified in vite config");
        } else {
            config.test.environment = "jsdom";
        }
    }

    return config.test;
};
