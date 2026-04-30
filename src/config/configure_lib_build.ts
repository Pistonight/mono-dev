import path from "node:path";
import fs from "node:fs";
import { defineConfig as viteDefineConfig } from "vite";

// note: not using subpath imports because they won't work in bootstrap
// if package.json does not already have the correct exports
import { getProjectPackageJsonPath, type PackageJson } from "#util";
import { parseExports } from "#project";

import { genViteDefines, genVitePlugins } from "./gen_vite.ts";

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
    const externalDeps = new Set<string>(monodevOptions.external || []);

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
        exports.map(({ entryName: entry_name, sourcePathAbs: source_path_abs }) => {
            // substring to remove "./"
            return [entry_name === "." ? "index" : entry_name, source_path_abs];
        }),
    );
    const file_name_config = Object.fromEntries(
        exports.map(({ entryName: entry_name, distPathRel: dist_path_rel }) => {
            // substring to remove "./"
            return [entry_name === "." ? "index" : entry_name, dist_path_rel];
        }),
    );

    const plugins = genVitePlugins(packageJson);

    return viteDefineConfig({
        plugins,
        define: {
            ...genViteDefines(packageJson),
            "import.meta.vitest": "undefined",
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
        if (exportName === "import" || exportName === "require") {
            continue; // built-in names
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
