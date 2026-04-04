import path from "node:path";
import fs from "node:fs";
import { defineConfig as viteDefineConfig } from "vite";
import vitePluginReact, { reactCompilerPreset as viteBabelReactCompilerPreset } from "@vitejs/plugin-react";
import vitePluginBabel from "@rolldown/plugin-babel";
import vitePluginYaml from "@modyfi/vite-plugin-yaml";
import babelReactCompiler from "babel-plugin-react-compiler";

import { get_package_json_path } from "./location.js";
import { parse_exports } from "./lib_parse_exports.js";
import { has_dependency } from "./util.js";


export const configure = () => {
    const package_json_path = get_package_json_path();
    const root_path = path.dirname(package_json_path);
    /** @type {import("./types.ts").PackageJson} */
    const package_json = JSON.parse(fs.readFileSync(package_json_path, "utf-8"));

    const [lib_exports, error] = parse_exports(root_path, package_json);
    if (error) {
        console.error("[monolibbuild] " + error);
        process.exit(1);
    }
    const { exports } = lib_exports;
    /** @type {Set<string>} */
    const external_deps = new Set();

    if (package_json.dependencies) {
        for (const dep in package_json.dependencies) {
            add_external_modules(root_path, dep, external_deps);
        }
    }
    if (package_json.peerDependencies) {
        for (const dep in package_json.peerDependencies) {
            add_external_modules(root_path, dep, external_deps);
        }
    }
    // console.log(external_deps);

    const entry_config = Object.fromEntries(
        exports.map(({entry_name, source_path_abs}) => {
            return [entry_name === "." ? "index" : entry_name, source_path_abs];
        })
    );
    const file_name_config = Object.fromEntries(
        exports.map(({entry_name, dist_path_rel}) => {
            return [entry_name === "." ? "index" : entry_name, dist_path_rel];
        })
    );

    const plugins = [];
    plugins.push(vitePluginYaml());
    if (has_dependency(package_json, "react")) {
        plugins.push(vitePluginReact());
        const reactCompilerPreset = viteBabelReactCompilerPreset();
        reactCompilerPreset.preset = () => {
            return {
                plugins: [[babelReactCompiler, {}]]
            }
        };

        plugins.push(vitePluginBabel({
            presets: [reactCompilerPreset]
        }));
    }

    return viteDefineConfig({
        plugins,
        resolve: {
            tsconfigPaths: true,
        },
        define: {
            "import.meta.vitest": "undefined",
        },
        build: {
            sourcemap: true,
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
                external: Array.from(external_deps)
            },
        }
    });
}

/**
 * Collect exports from the package and mark them as external (adding to out)
 *
 * @param {string} root_path
 * @param {string} package_name
 * @param {Set<string>} out
 */
const add_external_modules = (root_path, package_name, out) => {
    // add the default output no matter what
    out.add(package_name);

    const package_path = path.join(root_path, "node_modules", package_name);
    const package_json_path = path.join(package_path, "package.json");
    /** @type {import("./types.ts").PackageJson} */
    const package_json = JSON.parse(fs.readFileSync(package_json_path, "utf-8"));
    if (!package_json.exports || typeof package_json.exports === "string") {
        return;
    }
    for (const export_name in package_json.exports) {
        if (export_name === ".") {
            continue; // already added above
        }
        if (!export_name.startsWith("./")) {
            console.error(`[monolibbuild] unconventional package exports found for package '${package_name}'`);
            process.exit(1);
        }
        out.add(package_name+export_name.substring(1));
    }
}
