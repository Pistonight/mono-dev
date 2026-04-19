#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { Application } from "typedoc";
// import { load as typedocThemeOxidePlugin } from "./typedoc-theme-oxide/plugin/index.js";
import { load as typedocThemeOxidePlugin } from "typedoc-theme-oxide";
import { get_package_json_path } from "./location.js";
import { parse_exports } from "./lib_parse_exports.js";
import { run_monolint } from "./monolint.js";

const run_monotypedoc = async () => {
    const args = process.argv.slice(2);
    const watch = args.includes("--watch") || args.includes("-w");
    const json = args.includes("--json");

    const package_json_path = get_package_json_path();
    const root_path = path.dirname(package_json_path);
    /** @type {import("./types.ts").PackageJson} */
    const package_json = JSON.parse(fs.readFileSync(package_json_path, "utf-8"));

    const [lib_exports, error] = parse_exports(root_path, package_json);
    if (error) {
        console.error("[monotypedoc] " + error);
        process.exit(1);
    }
    const { src, exports } = lib_exports;

    const tsconfig_path = path.join(root_path, `tsconfig.${src}.json`);
    if (!fs.existsSync(tsconfig_path)) {
        await run_monolint(["--config"]);
        if (!fs.existsSync(tsconfig_path)) {
            console.error("[monolibbuild] failed to generate tsconfig for emitting declaration");
            process.exit(1);
        }
    }

    /** @type {Record<string, unknown>} */
    const options = {
        entryPoints: exports.map(({ source_path_abs }) => source_path_abs),
        entryPointStrategy: "resolve",
        out: path.join(root_path, json ? "docs.json" : "docs"),
        theme: "oxide",
        plugin: [typedocThemeOxidePlugin],
        tsconfig: tsconfig_path,
        highlightLanguages: ["typescript", "css", "rust", "bash"]
    };


    const app = await Application.bootstrapWithPlugins(options);

    if (watch) {
        await app.convertAndWatch(async (project) => {
            await app.generateDocs(project, /** @type {string} */ (options.out));
        });
    } else  {
        const project = await app.convert();
        if (!project) {
            console.error("[monotypedoc] failed to convert project");
            process.exit(1);
        }
        if (json) {
            await app.generateJson(project, /** @type {string} */ (options.out));
        } else {
            await app.generateDocs(project, /** @type {string} */ (options.out));
        }
    }
};

void run_monotypedoc();
