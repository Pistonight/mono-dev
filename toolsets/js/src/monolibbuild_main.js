import fs from "node:fs";
import path from "node:path";
import { get_package_json_path } from "./location.js";
import { stringify_sorted_indented } from "./json.js";
import { execute } from "./execute.js";

const main = () => {
    const package_json_path = get_package_json_path();
    const root_path = path.dirname(path.resolve(package_json_path));
    const cache_path = path.join(root_path, "node_modules/.monolibbuild");
    const config_path = path.join(cache_path, "vite.config.ts");
    /** @type {import("./types.ts").PackageJson} */
    const package_json = JSON.parse(fs.readFileSync(package_json_path, "utf-8"));

    /** @type {string[]} */
    const external_deps = [];

    if (package_json.dependencies) {
        external_deps.push(...Object.keys(package_json.dependencies));
    }
    if (package_json.peerDependencies) {
        external_deps.push(...Object.keys(package_json.peerDependencies));
    }

    external_deps.sort();

    /** @type {[string, string, string][]} */
    const entry_points = [];
    if (!package_json.exports) {
        console.error("[monolibbuild] no 'exports' in package.json");
        process.exit(1);
    }
    for (const entry_name in package_json.exports) {
        if (!entry_name.startsWith("./")) {
            console.error("[monolibbuild] entry name in 'exports' must start with './'");
            process.exit(1);
        }
        const entry_name2 = entry_name.substring(2);
        if (entry_name2.includes("/")) {
            console.error("[monolibbuild] entry name cannot contain '/' other than the initial './'");
            process.exit(1);
        }
        const target_path = package_json.exports[entry_name];
        if (!target_path.startsWith("./dist/")) {
            console.error("[monolibbuild] target name must start with './dist/'");
            process.exit(1);
        }
        if (!target_path.endsWith(".js")) {
            console.error("[monolibbuild] target name must end with '.js'");
            process.exit(1);
        }
        const target_path2 = target_path.substring(7, target_path.length-3);
        const ts_path = path.join(root_path, "src", target_path2 + ".ts");
        if (fs.existsSync(ts_path)) {
            entry_points.push([entry_name2, ts_path, target_path.substring(7)]);
            continue;
        }
        const tsx_path = ts_path + "x";
        if (fs.existsSync(tsx_path)) {
            entry_points.push([entry_name2, tsx_path, target_path.substring(7)]);
            continue;
        }
        console.error("[monolibbuild] cannot find source file for entry point '"+entry_name+"'");
        process.exit(1);
    }

    let config = `
import { resolve } from "node:path";
import { defineConfig } from "mono-dev/vite";
export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: {
`;
    for (const [entry_name, source_path] of entry_points) {
        config += `               ${JSON.stringify(entry_name)}: resolve(import.meta.dirname, ${JSON.stringify(source_path)}),\n`;
    }
    config +=`            },
            fileName: (_format, entry_name) => {
                switch (entry_name) {
`;
    for (const [entry_name, _, target_path] of entry_points) {
        config += `                   case ${JSON.stringify(entry_name)}: return ${JSON.stringify(target_path)};\n`;
    }
    config += `                   default: throw new Error("unknown entry point: " + entry_name)
                }
            },
            formats: ["es"],
        },
        rolldownOptions: {
            external: ${stringify_sorted_indented(external_deps, 12)},
        },
    }
});
    `;

    if (!fs.existsSync(cache_path)) {
        fs.mkdirSync(cache_path, { recursive:true });
    }
    fs.writeFileSync(config_path, config);

    const result = execute("vite", ["build", "--config", config_path]);
    if (result.status) {
        console.error("[monolibbuild] vite failed");
        process.exit(1);
    }
}

main();
