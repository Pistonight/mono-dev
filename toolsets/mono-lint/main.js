#!/usr/bin/env node

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

import fs from "fs/promises";
import fsSync from "fs";
import child_process from "child_process";
import path from "path";
import { run as prettierCli } from "@prettier/cli";

// TSGO issues:
// - doesn't support project references right now
// and seem to have some inconsistent behavior with naming inferred type
// ("The inferred type of 'x' cannot be named without a reference to 'y'")
const TSC = "tsc";

const pathCurrent = path.resolve(".");

// the prettierignore file must be here, because paths are resolved
// relative to where the ignore file is (like .gitignore) and cannot
// reference outside of the directory
const pathDotPrettierIgnore = ".prettierignore";
const pathCache = "./node_modules/.mono-lint";
const pathPrettierCache = `${pathCache}/.prettier-cache`;
const pathMonodev =
    path.basename(pathCurrent) === "toolsets" &&
    path.basename(path.dirname(pathCurrent)) === "mono-dev"
        ? path.dirname(pathCurrent)
        : "./node_modules/mono-dev";
// use the executable from mono-dev's node_modules, so downstream
// projects don't need to install them
// an exception is eslint is needed for eslint-lsp,
// either installed globally or in the workspace
const pathMonodevBin = path.join(
    path.dirname(path.dirname(import.meta.dirname)),
    "node_modules",
    ".bin",
);

const pathCurrProjPackageJson = (() => {
    let curr = pathCurrent;
    let currJson = path.join(curr, "package.json");
    while (!fsSync.existsSync(currJson)) {
        const nextCurr = path.dirname(curr);
        if (!nextCurr || nextCurr === curr) {
            return "."; // no package.json found, assuming current directory
        }
        curr = nextCurr;
        currJson = path.join(curr, "package.json");
    }
    return currJson;
})();

async function main() {
    // arguments:
    // --fix/-f to fix the files
    // --clean to remove cache and regenerate configs
    // --config to only generate the config
    const argv = process.argv.slice(2);
    const fix = argv.includes("--fix") || argv.includes("-f");
    const clean = argv.includes("--clean") || argv.includes("-c");
    const configOnly = argv.includes("--config");

    const hasTs = await createConfigs(clean);
    if (configOnly) {
        console.log("[mono-lint] config generated");
        return;
    }
    if (fix) {
        if (hasTs) {
            const eslint = runEslint(true);
            if (eslint.status) {
                console.error("[mono-lint] eslint fix failed, see above");
                process.exit(1);
            }
        }
        await runPrettier(true);
    }

    if (hasTs) {
        const tsc = await runTsc();
        if (tsc.status) {
            console.error("[mono-lint] tsc failed, see above");
            process.exit(1);
        }
        const eslint = runEslint(false);
        if (eslint.status) {
            console.error("[mono-lint] eslint failed, see above");
            process.exit(1);
        }
    }

    await runPrettier(false);
}

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
 */
async function createConfigs(clean) {
    const currentVersion = JSON.parse(
        await fs.readFile(`${pathMonodev}/package.json`),
    ).version.trim();
    // using sync operations here so they are less likely to fail, and when they do,
    // it's possible to catch them
    if (!(await exists(pathCache))) {
        fsSync.mkdirSync(pathCache, { recursive: true });
        fsSync.writeFileSync(`${pathCache}/version`, currentVersion);
    } else {
        if (!clean) {
            // check if mono-dev version was bumped
            try {
                const version = fsSync
                    .readFileSync(`${pathCache}/version`, "utf-8")
                    .trim();
                if (version !== currentVersion) {
                    console.log(
                        `[mono-lint] generating clean configs because of version update: ${version} -> ${currentVersion}`,
                    );
                    clean = true;
                }
            } catch {
                clean = true;
            }
        }
        if (clean) {
            fsSync.rmSync(pathCache, { recursive: true });
            fsSync.mkdirSync(pathCache, { recursive: true });
            // this can fail for some reason
            try {
                fsSync.writeFileSync(`${pathCache}/version`, currentVersion);
            } catch {
                console.error(
                    "[mono-lint] failed to write version file, will retry next time",
                );
            }
        }
    }
    const packageJson = JSON.parse(
        await fs.readFile(pathCurrProjPackageJson, "utf-8"),
    );
    let checkIgnoreLines = [];
    try {
        const gitignore = await fs.readFile(".gitignore", "utf-8");
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
        createTsConfigs(clean, packageJson),
        createPrettierIgnore(checkIgnoreLines),
    ]);
    if (ts.projectCount) {
        await createEslintConfig(
            checkIgnoreLines,
            packageJson,
            ts.nonTsDirectories,
        );
    }
    return ts.projectCount;
}

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
 * Also consider adding /tsconfig.*.json to .gitignore
 */
async function createTsConfigs(clean, packageJson) {
    const existingTsConfigs = new Set();
    const tsDirectories = [];
    const rootFiles = [];
    const nonTsDirectories = [];

    const promises = (await fs.readdir(".")).map(async (p) => {
        let stats;
        try {
            stats = await fs.stat(p);
        } catch (e) {
            console.error(e);
            console.warn(`[mono-lint] cannot stat ${p}, skipping`);
            return;
        }
        if (stats.isDirectory()) {
            const envFile = path.join(p, "env.d.ts");
            if (!(await exists(envFile))) {
                nonTsDirectories.push(p);
            } else {
                tsDirectories.push(p);
            }
            return;
        }
        if (
            p !== "tsconfig.json" &&
            p.startsWith("tsconfig.") &&
            p.endsWith(".json")
        ) {
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
    });

    let changed = false;

    let tsPathMappings = {};
    if (
        !("name" in packageJson) &&
        !("exports" in packageJson) &&
        !("file" in packageJson)
    ) {
        tsPathMappings = await createTsPathMappings();
    }
    const hasTsPathMappings = Object.keys(tsPathMappings).length > 0;

    const directoryPromises = tsDirectories.map(async (dir) => {
        const tsconfig = `tsconfig.${dir}.json`;
        // the tsconfig only depends on the dir name,
        // we should never need to regenerate it
        if (
            !(dir === "src" && hasTsPathMappings) &&
            !clean &&
            existingTsConfigs.has(tsconfig)
        ) {
            return;
        }
        const tsconfigContent = {
            extends: `${pathMonodev}/toolsets/mono-lint/default-tsconfig.json`,
            compilerOptions: {
                tsBuildInfoFile: `${pathCache}/tsconfig.${dir}.tsbuildinfo`,
            },
            include: [dir],
        };
        if (dir === "src" && hasTsPathMappings) {
            tsconfigContent.compilerOptions.paths = tsPathMappings;
        }
        await fs.writeFile(tsconfig, JSON.stringify(tsconfigContent, null, 4));
        changed = true;
    });

    const removeExisting = (async () => {
        for (const tsconfig of existingTsConfigsToRemove) {
            console.log(`[mono-lint] removing ${tsconfig}`);
            await fs.unlink(tsconfig);
            changed = true;
        }
    })();

    if (rootFiles.length) {
        const tsconfig = "tsconfig._.json";
        if (clean || !existingTsConfigs.has(tsconfig)) {
            const tsconfigContent = {
                extends: `${pathMonodev}/toolsets/mono-lint/default-tsconfig.json`,
                compilerOptions: {
                    tsBuildInfoFile: `${pathCache}/tsconfig._.tsbuildinfo`,
                },
                include: rootFiles,
            };
            await fs.writeFile(
                tsconfig,
                JSON.stringify(tsconfigContent, null, 4),
            );
            changed = true;
        }
    }

    const projectCount = rootFiles.length + tsDirectories.length;

    await removeExisting;
    await Promise.all(directoryPromises);

    if (projectCount) {
        if (changed || clean || !(await exists("tsconfig.json"))) {
            const references = tsDirectories.map((dir) => ({
                path: `./tsconfig.${dir}.json`,
            }));
            if (rootFiles.length) {
                references.push({ path: "./tsconfig._.json" });
            }
            const tsconfig = "tsconfig.json";

            let packageTsConfig = packageJson.tsconfig || {};

            const tsconfigContent = {
                compilerOptions: {},
                ...packageTsConfig,
                files: [],
                references,
            };
            if (hasTsPathMappings) {
                tsconfigContent.compilerOptions.paths = tsPathMappings;
            }
            await fs.writeFile(
                tsconfig,
                JSON.stringify(tsconfigContent, null, 4),
            );
        }
    } else {
        if (await exists("tsconfig.json")) {
            console.log("[mono-lint] removing tsconfig.json");
            await fs.unlink("tsconfig.json");
        }
    }
    return { projectCount, nonTsDirectories };
}

async function createTsPathMappings() {
    let rest = [];
    try {
        const top = await fs.readdir("./src");
        for (const p of top) {
            if (p.match(/index\.(c|m)?tsx?$/)) {
                return {};
            }
            const srcPath = `src/${p}`;
            if ((await fs.stat(srcPath)).isDirectory()) {
                rest.push(srcPath.replace(/\/+$/, ""));
            }
        }
    } catch {}

    const tsPathMappings = {};

    while (rest.length) {
        const next = rest.pop();
        if (!next) {
            break;
        }
        try {
            const files = await fs.readdir(next);
            let dirs = [];
            for (const f of files) {
                const srcPath = `${next}/${f}`;
                if (f.match(/index\.(c|m)?tsx?$/)) {
                    tsPathMappings[next.replace(/^src\//, "self::")] = [
                        `./${srcPath}`,
                    ];
                    dirs = [];
                    break;
                }
                if ((await fs.stat(srcPath)).isDirectory()) {
                    dirs.push(srcPath.replace(/\/+$/, ""));
                }
            }
            rest.push(...dirs);
        } catch {}
    }

    const entries = Object.entries(tsPathMappings);
    entries.sort(([a], [b]) => a.localeCompare(b));
    return Object.fromEntries(entries);
}

/**
 * ESLint config
 *
 * We have a standard ESLint config that we use for all projects.
 *
 * If "react" is found in any dependencies, then react plugins and rules
 * are loaded, otherwise they are not.
 */

async function createEslintConfig(
    checkIgnoreLines,
    packageJson,
    nonTsDirectories,
) {
    let react = false;
    if (packageJson.dependencies) {
        react = "react" in packageJson.dependencies;
    }
    if (!react && packageJson.devDependencies) {
        react = "react" in packageJson.devDependencies;
    }
    if (!react && packageJson.peerDependencies) {
        react = "react" in packageJson.peerDependencies;
    }
    if (!react && packageJson.optionalDependencies) {
        react = "react" in packageJson.optionalDependencies;
    }
    if (!react && packageJson.bundledDependencies) {
        react = "react" in packageJson.bundledDependencies;
    }

    const ignore = [
        ...nonTsDirectories,
        "./eslint.config.js", // ignore ourself
    ];
    for (const line of checkIgnoreLines) {
        if (line.includes("tsconfig") || line.includes("eslint.config.js")) {
            continue;
        }
        if (line.startsWith("!")) {
            continue;
        }
        if (line.startsWith("/")) {
            ignore.push(`.${line}`);
        }
        ignore.push(`**/${line}`);
    }

    const config = `import { config } from "mono-dev/eslint";
export default config({
    ignores: ${JSON.stringify(ignore)},
    react: ${react},
    tsconfigRootDir: import.meta.dirname
});`;
    await fs.writeFile("eslint.config.js", config);
}

async function createPrettierIgnore(checkIgnoreLines) {
    const prettierIgnorePath = pathDotPrettierIgnore;
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
    for (const line of checkIgnoreLines) {
        if (line.includes("tsconfig") || line.includes("eslint.config.js")) {
            continue;
        }
        ignore.push(line);
    }
    await fs.writeFile(prettierIgnorePath, ignore.join("\n"));
}

async function runTsc() {
    if (TSC === "tsc") {
        return execute(TSC, ["--build", "--pretty"]);
    }
    // TSGO currently does not support --build, so we have to
    // do that ourselves
    const tsconfigs = [];
    try {
        const folder = await fs.readdir(".");
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
}

function runEslint(fix) {
    const args = [
        ".",
        "--color",
        "--report-unused-disable-directives",
        "--max-warnings=0",
        "--cache",
        "--cache-location",
        "./node_modules/.mono-lint/.eslintcache",
    ];
    if (fix) {
        args.push("--fix");
    }
    return execute("eslint", args);
}

function runPrettier(fix) {
    // there are some weird-ness when running prettier like this,
    // for example i can't figure out how to set the ignorePath

    // See types.ts in @prettier/cli
    // https://github.com/prettier/prettier-cli/blob/main/src/types.ts
    const options = {
        /* INPUT OPTIONS */
        globs: ["."],
        /* OUTPUT OPTIONS */
        check: !fix,
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
        // /* FORMAT OPTIONS */
        formatOptions: { endOfLine: "auto", tabWidth: 4 },
    };

    return prettierCli(options, {}, {});
}

function execute(bin, args) {
    if (process.platform === "win32") {
        bin += ".cmd";
    }

    const binPath = path.join(pathMonodevBin, bin);

    // execution is not parallel because:
    // 1. it's very annoying to do that in node
    // 2. multiple projects can run at the same time (external parallellism)
    let child;
    if (process.platform === "win32") {
        child = child_process.spawnSync(`"${binPath}"`, args, {
            stdio: "inherit",
            shell: true,
        });
    } else {
        child = child_process.spawnSync(binPath, args, { stdio: "inherit" });
    }
    // for some reason node doesn't throw here...
    // so we have to check the error manually
    if (child.error) {
        console.error(
            `[mono-lint] failed to spawn ${bin} with args ${args.join(" ")}`,
        );
        console.error(child.error);
        child.status = 1;
    }
    return child;
}

async function exists(path) {
    try {
        await fs.stat(path);
        return true;
    } catch {
        return false;
    }
}

void main();
