import path from "node:path";
import fs from "node:fs";
import { defineConfig as viteDefineConfig } from "vite";
import vitePluginReact, {
    reactCompilerPreset as viteBabelReactCompilerPreset,
} from "@vitejs/plugin-react";
import vitePluginBabel from "@rolldown/plugin-babel";
import babelReactCompiler from "babel-plugin-react-compiler";
import vitePluginWasm from "vite-plugin-wasm";

import { viteYaml } from "#plugins";
import { getProjectPackageJsonPath, hasDependency, PackageJson } from "#util";
import { parseExports } from "#project";

export const configure = () => {
    const packageJsonPath = getProjectPackageJsonPath();
    const rootDir = path.dirname(packageJsonPath);
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    const monodevOptions = packageJson["pistonight/mono-dev"] || {};
    const sourcemapOption = "sourcemap" in monodevOptions ? monodevOptions.sourcemap : true;

    const libExports = parseExports(rootDir, packageJson);
    if ("err" in libExports) {
        console.error("[mono] failed to parse exports: " + libExports.err);
        process.exit(1);
    }
    const { exports } = libExports.val;
    const externalDeps = new Set<string>();

    if (packageJson.dependencies) {
        for (const dep in packageJson.dependencies) {
            addExternalModules(rootDir, dep, externalDeps);
        }
    }
    if (packageJson.peerDependencies) {
        for (const dep in packageJson.peerDependencies) {
            addExternalModules(rootDir, dep, externalDeps);
        }
    }
    // console.log(external_deps);

    const entry_config = Object.fromEntries(
        exports.map(({ entry_name, source_path_abs }) => {
            return [entry_name === "." ? "index" : entry_name, source_path_abs];
        }),
    );
    const file_name_config = Object.fromEntries(
        exports.map(({ entry_name, dist_path_rel }) => {
            return [entry_name === "." ? "index" : entry_name, dist_path_rel];
        }),
    );

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
    if (monodevOptions.wasm) {
        plugins.push(vitePluginWasm());
    }

    return viteDefineConfig({
        plugins,
        resolve: {
            tsconfigPaths: true,
        },
        define: {
            "import.meta.vitest": "undefined",
            "import.meta.version": JSON.stringify(packageJson.version),
        },
        build: {
            sourcemap: sourcemapOption,
            lib: {
                entry: entry_config,
                fileName: (_format, entry_name) => {
                    if (!(entry_name in file_name_config)) {
                        throw new Error("unexpected unknown entry point: " + entry_name);
                    }
                    return file_name_config[entry_name];
                },
                formats: ["es"],
            },
            rolldownOptions: {
                external: Array.from(externalDeps),
            },
        },
    });
};

/**
 * Collect exports from the package and mark them as external (adding to out)
 */
const addExternalModules = (rootDir: string, packageName: string, out: Set<string>) => {
    // add the default output no matter what
    out.add(packageName);

    const package_Path = path.join(rootDir, "node_modules", packageName);
    const packageJsonPath = path.join(package_Path, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    if (!packageJson.exports || typeof packageJson.exports === "string") {
        return;
    }
    for (const exportName in packageJson.exports) {
        if (exportName === ".") {
            continue; // already added above
        }
        if (!exportName.startsWith("./")) {
            console.error(
                `[mono] unconventional package exports found for package '${packageName}'`,
            );
            process.exit(1);
        }
        out.add(packageName + exportName.substring(1));
    }
};
