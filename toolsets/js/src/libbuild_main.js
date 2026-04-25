import fs from "node:fs";
import path from "node:path";

import { execute } from "./execute.js";
import { get_package_json_path } from "./location.js";
import { run_monolint } from "./monolint.js";
import { DTS } from "./util.js";
import { stringify_sorted } from "./json.js";
import { parse_exports } from "./lib_parse_exports.js";

const run_libbuild = async () => {
    await run_monolint(["--config"]);
    const package_json_path = get_package_json_path();
    const root_path = path.dirname(package_json_path);
    const cache_path = path.join(root_path, "node_modules/.monolibbuild");
    if (!fs.existsSync(cache_path)) {
        fs.mkdirSync(cache_path, { recursive: true });
    }
    const vite_config_path = path.join(cache_path, "vite.config.ts");
    fs.writeFileSync(
        vite_config_path,
        `
import { configure } from "mono-dev/lib-build";
export default configure();
`,
    );

    const vite_child = execute("vite", ["build", "--config", vite_config_path]);
    if (vite_child.status) {
        console.error("[mono] bundle with vite failed, please see error above");
        process.exit(vite_child.status || 1);
    }
    /** @type {import("./types.ts").PackageJson} */
    const package_json = JSON.parse(fs.readFileSync(package_json_path, "utf-8"));
    const [lib_exports, error] = parse_exports(root_path, package_json, true /* print */);
    if (error) {
        console.error("[mono] " + error);
        process.exit(1);
    }
    const { dist, src } = lib_exports;

    const tsconfig_path = path.join(root_path, "tsconfig." + src + ".json");
    if (!fs.existsSync(tsconfig_path)) {
        console.error("[mono] failed to generate tsconfig for emitting declaration");
        process.exit(1);
    }
    const the_config = JSON.parse(fs.readFileSync(tsconfig_path, "utf-8"));

    const tsbuildinfo = `${cache_path}/tsconfig.${src}__${DTS}.tsbuildinfo`;
    // if we don't delete the incremental build file, tsc will not emit the output
    // if no rebuild is needed (even if the output is gone because we clean it before building)
    // -- truly amazing behavior
    if (fs.existsSync(tsbuildinfo)) {
        fs.unlinkSync(tsbuildinfo);
    }

    the_config.compilerOptions.tsBuildInfoFile = tsbuildinfo;
    the_config.compilerOptions.noEmit = false;
    the_config.compilerOptions.outDir = path.join(dist, DTS);
    the_config.exclude = ["**/*.test.ts", "**/*.test.mts", "**/*.test.cts", "**/*.test.tsx"];
    const tsconfig_modified_path = path.join(root_path, "tsconfig." + src + "__" + DTS + ".json");
    fs.writeFileSync(tsconfig_modified_path, stringify_sorted(the_config));

    const tsc_child = execute("tsc", ["-p", tsconfig_modified_path]);
    if (tsc_child.status) {
        console.error("[mono] dts generation with tsc failed, please see error above");
        process.exit(tsc_child.status || 1);
    }
    console.log("[mono] dts generated at " + dist + "/" + DTS);
};

void run_libbuild();
