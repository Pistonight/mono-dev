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
 *
 * Other generated files might be placed in node_modules
 *
 * This script assumes it's being run from the root of the project,
 * i.e. the directory containing package.json
 */

import fs from "fs/promises";
import child_process from "child_process";
import path from "path";
import { run as prettierCli } from "@prettier/cli";

// prettier ignore must be here, because paths are resolved
// relative to where the ignore file is (like .gitignore)
// and cannot reference outside of the directory
const pathDotPrettierIgnore = ".prettierignore";
const pathPrettierCache = "./node_modules/.mono-lint/.prettier-cache";

void main();

async function main() {
    // we accept 2 arguments:
    // --fix/-f to fix the files
    // --clean/-c to remove cache and regenerate configs
    const argv = process.argv.slice(2);
    const fix = argv.includes("--fix") || argv.includes("-f");
    const clean = argv.includes("--clean") || argv.includes("-c");

    const hasTs = await createConfigs(clean);
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
        const tsc = runTsc();
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
 * See below
 */
async function createConfigs(clean) {
    const cacheDir = "./node_modules/.mono-lint";
    if (!(await exists(cacheDir))) {
        await fs.mkdir(cacheDir, { recursive: true });
    } else if (clean) {
        console.log("[mono-lint] removing cache at ./node_modules/.mono-lint");
        await fs.rm(cacheDir, { recursive: true });
        await fs.mkdir(cacheDir, { recursive: true });
    }
    const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"));
    const gitignore = await fs.readFile(".gitignore", "utf-8");
    const checkIgnoreLines = gitignore
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    if (packageJson.nocheck) {
        checkIgnoreLines.push(...packageJson.nocheck);
    }
    const [ts] = await Promise.all([
        createTsConfigs(clean),
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
async function createTsConfigs(clean) {
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

    const monoDevPath =
        path.basename(path.resolve(".")) === "mono-dev"
            ? "."
            : "./node_modules/mono-dev";

    const directoryPromises = tsDirectories.map(async (dir) => {
        const tsconfig = `tsconfig.${dir}.json`;
        // the tsconfig only depends on the dir name,
        // we should never need to regenerate it
        if (!clean && existingTsConfigs.has(tsconfig)) {
            return;
        }
        const tsconfigContent = {
            extends: `${monoDevPath}/tsconfig/defaults.json`,
            compilerOptions: {
                tsBuildInfoFile: `./node_modules/.mono-lint/tsconfig.${dir}.tsbuildinfo`,
                baseUrl: dir,
            },
            include: [dir],
        };
        console.log(`[mono-lint] creating tsconfig for ./${dir}/`);
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
                extends: `${monoDevPath}/tsconfig/defaults.json`,
                compilerOptions: {
                    tsBuildInfoFile:
                        "./node_modules/.mono-lint/tsconfig._.tsbuildinfo",
                },
                include: rootFiles,
            };
            console.log("[mono-lint] creating tsconfig for ./");
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
            console.log(
                "[mono-lint] regenerating tsconfig.json because project structure has changed.",
            );
            const references = tsDirectories.map((dir) => ({
                path: `./tsconfig.${dir}.json`,
            }));
            if (rootFiles.length) {
                references.push({ path: "./tsconfig._.json" });
            }
            const tsconfig = "tsconfig.json";
            const tsconfigContent = {
                files: [],
                references,
            };
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

function runTsc() {
    return execute("tsc", ["--build", "--pretty"]);
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
    // use the executable from mono-dev's node_modules, so downstream
    // projects don't need to install them
    // an exception is eslint is needed for eslint-lsp,
    // either installed globally or in the workspace
    const binPath = path.join(
        path.dirname(import.meta.dirname),
        "node_modules",
        ".bin",
        bin,
    );

    // execution is not parallel because:
    // 1. it's very annoying to do that in node
    // 2. multiple projects can run at the same time (external parallellism)
    if (process.platform === "win32") {
        return child_process.spawnSync(`"${binPath}"`, args, {
            stdio: "inherit",
            shell: true,
        });
    }
    return child_process.spawnSync(binPath, args, { stdio: "inherit" });
}

async function exists(path) {
    try {
        await fs.stat(path);
        return true;
    } catch {
        return false;
    }
}
