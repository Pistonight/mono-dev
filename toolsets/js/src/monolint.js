/**
 * "zero config" linting for ECMAScript projects
 *
 * This basically invokes other linters with pre-configured flags.
 *
 * For compatibility with other tools and LSPs, it will also
 * automatically create and zap the .gitignore file to ignore
 * those generated files:
 * - /eslint.config.js
 * - /tsconfig*.json
 * - .prettierignore
 *
 * Other generated files might be placed in node_modules
 *
 * This script assumes it's being run from the root of the project,
 * i.e. the directory containing package.json
 */

import fs from "node:fs";
import fs_promises from "node:fs/promises";
import path from "node:path";
import { run as prettierCli } from "@prettier/cli";

import { get_monodev_version, get_package_json_path, monodev_path } from "./location.js";
import { DTS, has_dependency, normalize_lineend } from "./util.js";
import { execute } from "./execute.js";
import { stringify_sorted } from "./json.js";
import { ensure_subpath_imports } from "./subpath_imports.js";

// TSGO issues:
// - doesn't support project references right now
// and seem to have some inconsistent behavior with naming inferred type
// ("The inferred type of 'x' cannot be named without a reference to 'y'")
const TSC = "tsc";

// the prettierignore file must be here, because paths are resolved
// relative to where the ignore file is (like .gitignore) and cannot
// reference outside of the directory
const pathCurrProjPackageJson = get_package_json_path();
const pathRoot = path.dirname(path.resolve(pathCurrProjPackageJson));
const pathDotPrettierIgnore = path.join(pathRoot, ".prettierignore");
const pathCache = path.join(pathRoot, "node_modules/.monolint");
const pathPrettierCache = path.join(pathCache, ".prettier-cache");
const pathEslintCache = path.join(pathCache, ".eslint-cache");

/** @param {string[]} argv */
export const run_monolint = async (argv) => {
    // arguments:
    // --fix/-f to fix the files
    // --clean to remove cache and regenerate configs
    // --config to only generate the config
    const fix = argv.includes("--fix") || argv.includes("-f");
    const clean = argv.includes("--clean") || argv.includes("-c");
    const config_only = argv.includes("--config") || argv.includes("-g");

    const ts_proj_count = await create_configs(clean);
    if (config_only) {
        console.log("[mono] config generated");
        return;
    }

    if (ts_proj_count && !fix) {
        // run TSC first if not fixing
        const tsc = await run_tsc();
        if (tsc.status) {
            console.error("[mono] tsc failed, see above");
            process.exit(1);
        }
    }

    const eslint = await run_eslint(fix);
    if (eslint.status) {
        if (fix) {
            console.error("[mono] eslint fix failed, see above");
        } else {
            console.error("[mono] eslint check failed, see above");
        }
        process.exit(1);
    }

    await run_prettier(fix); // will exit if fail

    if (ts_proj_count && !fix) {
        // run TSC last to verify when fixing
        const tsc = await run_tsc();
        if (tsc.status) {
            console.error("[mono] typeck failed, see above");
            process.exit(1);
        }
        console.log("[mono] typeck passed!");
    }
};

/**
 * Create the configs based on "zero config" rules
 *
 * ... Well, except we can't magically figure out what should be ignored
 * for eslint/prettier. .gitignore and files we generate are automatically included,
 * additionally, `packageJson.nocheck` is an additional array of paths to ignore,
 * using the same format as .gitignore.
 *
 * TypeScript configs are created based on the presence of env.d.ts files in directories.
 * See https://mono.pistonite.dev/tool_ecma#check-and-fix
 *
 * @param {boolean} clean
 */
const create_configs = async (clean) => {
    const current_version = get_monodev_version();
    // using sync operations here so they are less likely to fail, and when they do,
    // it's possible to catch them
    if (!fs.existsSync(pathCache)) {
        fs.mkdirSync(pathCache, { recursive: true });
        fs.writeFileSync(`${pathCache}/version`, current_version);
    } else {
        if (!clean) {
            // check if mono-dev version was bumped
            try {
                const version = fs.readFileSync(`${pathCache}/version`, "utf-8").trim();
                if (version !== current_version) {
                    console.log(
                        `[mono] cleaning cache because of version update: ${version} -> ${current_version}`,
                    );
                    clean = true;
                }
            } catch {
                clean = true;
            }
        }
        if (clean) {
            fs.rmSync(pathCache, { recursive: true });
            fs.mkdirSync(pathCache, { recursive: true });
            // this can fail for some reason
            try {
                fs.writeFileSync(`${pathCache}/version`, current_version);
            } catch {
                console.error("[mono] failed to write version file, will retry next time");
            }
        }
    }
    /** @type {import("./types.ts")}.PackageJson */
    const packageJson = JSON.parse(fs.readFileSync(pathCurrProjPackageJson, "utf-8"));
    if (!packageJson.private) {
        console.error("[mono] 'private' must be set to true to prevent accidental publishing; to pack for publishing please use monopack");
        process.exit(31);
    }
    await ensure_subpath_imports(packageJson, pathCurrProjPackageJson);

    let checkIgnoreLines = [];
    try {
        const gitignore = fs.readFileSync(path.join(pathRoot, ".gitignore"), "utf-8");
        checkIgnoreLines = gitignore
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
    } catch {
        checkIgnoreLines = [];
    }
    if (packageJson.nocheck) {
        checkIgnoreLines.push(...packageJson.nocheck);
    }
    const [ts] = await Promise.all([
        create_ts_configs(packageJson),
        create_prettier_ignore(checkIgnoreLines),
    ]);
    if (ts.projectCount) {
        await create_eslint_config(checkIgnoreLines, packageJson, ts.nonTsDirectories);
    }
    return ts.projectCount;
};

/**
 * Type-Checking
 *
 * Because we need to be "zero config", libs and types
 * need to be defined in env.d.ts
 *
 * Each directory is type-checked separately, for a directory
 * to be type-checked, it must contain a env.d.ts file.
 *
 * If any ts file is found in the root directory, the root
 * will also be considered a type-checking directory.
 *
 * Also please add /tsconfig.*.json to .gitignore
 *
 * @param {import("./types.ts").PackageJson} packageJson
 */
const create_ts_configs = async (packageJson) => {
    const existingTsConfigs = new Set();
    const tsDirectories = [];
    const rootFiles = [];
    const nonTsDirectories = [];

    /** @type {Set<string>} */
    const ignore_paths = new Set();
    if (packageJson.nocheck) {
        for (const path of packageJson.nocheck) {
            if (path.startsWith("/") && !path.substring(1).includes("/")) {
                // /foo
                ignore_paths.add(path.substring(1));
                continue;
            }
            if (!path.includes("/")) {
                // foo
                ignore_paths.add(path);
                continue;
            }
        }
    }

    const promises = (await fs_promises.readdir(".")).map(async (p) => {
        const basename = path.basename(p);
        if (ignore_paths.has(basename)) {
            nonTsDirectories.push(p);
            return;
        }
        let stats;
        try {
            stats = await fs_promises.stat(p);
        } catch (e) {
            console.error(e);
            console.warn(`[mono] cannot stat ${p}, skipping`);
            return;
        }
        if (stats.isDirectory()) {
            const envFile = path.join(p, "env.d.ts");
            if (!fs.existsSync(envFile)) {
                nonTsDirectories.push(p);
            } else {
                tsDirectories.push(p);
            }
            return;
        }
        if (p !== "tsconfig.json" && p.startsWith("tsconfig.") && p.endsWith(".json")) {
            existingTsConfigs.add(p);
            return;
        }
        if (p.match(/\.(c|m)?tsx?$/)) {
            rootFiles.push(p);
        }
    });
    await Promise.all(promises);

    const existingTsConfigsToRemove = new Set(existingTsConfigs);

    // keep existing ts configs, so OS doesn't have to recreate the file on disk
    if (rootFiles.length) {
        existingTsConfigsToRemove.delete("tsconfig._.json");
    }
    tsDirectories.forEach((dir) => {
        existingTsConfigsToRemove.delete(`tsconfig.${dir}.json`);
        existingTsConfigsToRemove.delete(`tsconfig.${dir}__${DTS}.json`);
    });

    const directoryPromises = tsDirectories.map(async (dir) => {
        const tsconfig = `tsconfig.${dir}.json`;
        // the tsconfig only depends on the dir name,
        // we should never need to regenerate it
        const tsconfigContent = {
            extends: path.join(
                monodev_path,
                "toolsets",
                "js",
                "typescript",
                "default-tsconfig.json",
            ),
            compilerOptions: {
                tsBuildInfoFile: path.join(pathCache, `tsconfig.${dir}.tsbuildinfo`),
                rootDir: "."
            },
            include: [dir],
        };
        await fs_promises.writeFile(tsconfig, normalize_lineend(stringify_sorted(tsconfigContent)));
    });

    const removeExisting = (async () => {
        for (const tsconfig of existingTsConfigsToRemove) {
            console.log(`[mono] removing ${tsconfig}`);
            await fs_promises.unlink(tsconfig);
        }
    })();

    if (rootFiles.length) {
        const tsconfig = "tsconfig._.json";
        const tsconfigContent = {
            extends: path.join(
                monodev_path,
                "toolsets",
                "js",
                "typescript",
                "default-tsconfig.json",
            ),
            compilerOptions: {
                tsBuildInfoFile: path.join(pathCache, `tsconfig._.tsbuildinfo`),
                rootDir: "."
            },
            include: rootFiles,
        };
        await fs_promises.writeFile(
            tsconfig,
            normalize_lineend(stringify_sorted(tsconfigContent)),
        );
    }

    const projectCount = rootFiles.length + tsDirectories.length;

    await removeExisting;
    await Promise.all(directoryPromises);

    if (projectCount) {
        const references = tsDirectories.map((dir) => ({
            path: `./tsconfig.${dir}.json`,
        }));
        if (rootFiles.length) {
            references.push({ path: "./tsconfig._.json" });
        }
        const tsconfig = "tsconfig.json";

        /** @type {any} */
        let packageTsConfig = packageJson.tsconfig || {};

        const tsconfigContent = {
            compilerOptions: {},
            ...packageTsConfig,
            files: [],
            references,
        };
        await fs_promises.writeFile(
            tsconfig,
            normalize_lineend(stringify_sorted(tsconfigContent)),
        );
    } else {
        if (fs.existsSync("tsconfig.json")) {
            console.log("[mono] removing tsconfig.json");
            await fs_promises.unlink("tsconfig.json");
        }
    }
    return { projectCount, nonTsDirectories };
};

/**
 * ESLint config
 *
 * We have a standard ESLint config that we use for all projects.
 *
 * If "react" is found in any dependencies, then react plugins and rules
 * are loaded, otherwise they are not.
 *
 * @param {string[]} ignore_config_lines
 * @param {import("./types.ts").PackageJson} package_json
 * @param {string[]} non_ts_dirs
 */
const create_eslint_config = async (ignore_config_lines, package_json, non_ts_dirs) => {
    const react = has_dependency(package_json, "react");

    const ignore = [
        ...non_ts_dirs,
        "./eslint.config.js", // ignore ourself
    ];
    for (const line of ignore_config_lines) {
        if (line.includes("tsconfig") || line.includes("eslint.config.js")) {
            continue;
        }
        if (line.startsWith("!")) {
            continue;
        }
        if (line.startsWith("/")) {
            ignore.push(`.${line}`);
        } else {
            ignore.push(`**/${line}`);
        }
    }

    let is_public_lib = false;
    if (package_json.files) {
        for (const f of package_json.files) {
            if (f.startsWith("./dist") || f.startsWith("dist")) {
                // is a compiled library
                is_public_lib = true;
                break;
            }
        }
    }

    const config = `import { config } from "mono-dev/eslint";
export default config({
    ignores: ${stringify_sorted(ignore)},
    react: ${react},
    isLib: ${is_public_lib},
    tsconfigRootDir: import.meta.dirname
});`;
    await fs_promises.writeFile("eslint.config.js", normalize_lineend(config));
};

/** @param {string[]} ignore_config_lines */
const create_prettier_ignore = async (ignore_config_lines) => {
    const ignore = [
        "*.yml",
        "*.yaml",
        "*.toml",
        "*.md",
        "*.html",
        "*.hbs",
        "tsconfig*.json",
        "eslint.config.js",
    ];
    for (const line of ignore_config_lines) {
        if (line.includes("tsconfig") || line.includes("eslint.config.js")) {
            continue;
        }
        ignore.push(line);
    }
    await fs_promises.writeFile(pathDotPrettierIgnore, ignore.join("\n"));
};

const run_tsc = async () => {
    if (TSC === "tsc") {
        return execute(TSC, ["--build", "--pretty"]);
    }
    // TSGO currently does not support --build, so we have to
    // do that ourselves
    const tsconfigs = [];
    try {
        const folder = await fs_promises.readdir(".");
        for (const file of folder) {
            if (file.match(/tsconfig\..+\.json$/)) {
                tsconfigs.push(file);
            }
        }
    } catch {}
    let tsc;
    for (const tsconfig of tsconfigs) {
        tsc = execute(TSC, ["--project", tsconfig, "--pretty"]);
        if (tsc.status) {
            break;
        }
    }
    return tsc;
};

/** @param {boolean} fix */
const run_eslint = async (fix) => {
    const args = [
        ".",
        "--color",
        "--report-unused-disable-directives",
        "--max-warnings=0",
        "--cache",
        "--cache-location",
        pathEslintCache,
    ];
    if (fix) {
        args.push("--fix");
    }
    return execute("eslint", args);
};

/** @param {boolean} fix */
const run_prettier = (fix) => {
    // there are some weird-ness when running prettier like this,
    // for example i can't figure out how to set the ignorePath

    // See types.ts in @prettier/cli
    // https://github.com/prettier/prettier-cli/blob/main/src/types.ts
    /** @type {import("@prettier/cli/dist/types.js").Options} */
    const options = {
        /* INPUT OPTIONS */
        globs: ["."],
        /* OUTPUT OPTIONS */
        check: !fix,
        dump: false,
        list: false,
        write: fix,
        /* CONFIG OPTIONS */
        config: true,
        configPath: undefined,
        editorConfig: true,
        ignore: true,
        ignorePath: [pathDotPrettierIgnore],
        withNodeModules: false,
        /* OTHER OPTIONS */
        cache: true,
        cacheLocation: pathPrettierCache,
        errorOnUnmatchedPattern: true,
        ignoreUnknown: true,
        logLevel: "log",
        parallel: false,
        parallelWorkers: 0,
        stdinFilepath: undefined,
        /* CONTEXT OPTIONS */
        contextOptions: {},
        /* FORMAT OPTIONS */
        formatOptions: {
            endOfLine: "auto",
            tabWidth: 4,
            printWidth: 100,
        },
    };

    return prettierCli(options, {}, {});
};
