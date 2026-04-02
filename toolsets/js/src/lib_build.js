import path from "node:path";
import fs from "node:fs";
import { defineConfig as viteDefineConfig } from "vite";
import { get_package_json_path } from "./location.js";
import { parse_exports } from "./lib_parse_exports.js";


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
    /** @type {string[]} */
    const external_deps = [];

    if (package_json.dependencies) {
        external_deps.push(...Object.keys(package_json.dependencies));
    }
    if (package_json.peerDependencies) {
        external_deps.push(...Object.keys(package_json.peerDependencies));
    }

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

    return viteDefineConfig({
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
                external: external_deps
            },
        }
    });
}
