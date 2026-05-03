import path from "node:path";
import fs from "node:fs";

import {
    DTS,
    SRC,
    DIST,
    type Result,
    type PackageJson,
    type LibExportConfig,
    type ParsedExport,
    logInfo,
    logWarn,
    logError,
} from "#util";

export const parseExports = (
    root: string,
    packageJson: PackageJson,
    print = false,
): Result<LibExportConfig, string> => {
    if (!packageJson.exports) {
        return {
            val: {
                exports: [],
            },
        };
    }
    if (typeof packageJson.exports === "string") {
        return { err: "'exports' must be the object form in order for types to be respected" };
    }
    if (packageJson.types) {
        return {
            err: "'types' field must not be specified in package.json; use exports.<entry>.types",
        };
    }
    const exports = packageJson.exports;
    const nocompile = new Set(packageJson["pistonight/mono-dev"]?.nocompile || []);
    const compile = packageJson["pistonight/mono-dev"]?.compile || {};
    const SRC_PREFIX = "./" + SRC + "/";

    const parsedExports: ParsedExport[] = [];
    for (const name in exports) {
        let entryFileName = name;
        if (name !== ".") {
            if (!name.startsWith("./")) {
                return { err: "entry name subpath must start with './'" };
            }
            entryFileName = name.substring(2);
            if (entryFileName.includes("/")) {
                return {
                    err: "too avoid over-complicated export paths, entry name cannot contain '/' other than the initial './'",
                };
            }
            if (entryFileName.includes(".")) {
                return { err: "entry name cannot contain '.' other than the initial './'" };
            }
        }
        const target = exports[name];
        // only process exports not marked with nocompile
        if (nocompile.has(name)) {
            if (print) {
                logWarn(`skipping nocompile export '${name}'`);
            }
            continue;
        }

        if (typeof target !== "string") {
            const distPath = target.import;
            if (!distPath) {
                return {
                    err: `object-type 'exports' must be have an 'import' (for entry point '${name}')`,
                };
            }
            if (!distPath.startsWith("./" + DIST + "/") || !distPath.endsWith(".js")) {
                return {
                    err: `object-type 'exports' .import must start with ./${DIST}/ and end with .js (for entry point '${name}')`,
                };
            }
            const expectedTypesPath =
                "./" +
                DIST +
                "/" +
                DTS +
                "/" +
                SRC +
                distPath.substring(DIST.length + 2, distPath.length - 3) +
                ".d.ts";
            const typesPath = target.types;
            if (typesPath !== expectedTypesPath) {
                return {
                    err: `object-type 'exports' .import=${distPath} must be have .types=${expectedTypesPath} (for entry point '${name}')`,
                };
            }
            const sourcePath = compile[name];
            if (!sourcePath) {
                return {
                    err: `object-type 'exports' must have the source specified in mono-dev 'compile' option (for entry point '${name}')`,
                };
            }
            const sourcePathAbs = path.join(root, sourcePath);
            if (!fs.existsSync(sourcePathAbs)) {
                return {
                    err: `couldn't find extra compile source ${sourcePath} (for entry point '${name}')`,
                };
            }
            if (print) {
                logInfo(`configured compile entry "${name}": ${sourcePath}`);
            }
            parsedExports.push({
                entryName: entryFileName,
                sourcePathAbs: sourcePathAbs,
                distPathRel: distPath.substring(DIST.length + 3),
                distDtsPathRel: typesPath.substring(DIST.length + 3),
            });
            continue;
        }
        if (name.includes(" ")) {
            return { err: `entry name must not contain space: '${name}'` };
        }
        if (name === "index") {
            return { err: `entry name must not be "index", use "." instead` };
        }
        if (name === DTS) {
            return { err: `entry name must not be "${DTS}"` };
        }

        if (target.endsWith(".d.ts")) {
            // raw decalaration export, skip processing
            if (print) {
                logWarn(`skipping raw .d.ts export '${name}'`);
            }
            continue;
        }
        if (!target.match(/\.(c|m)?tsx?$/)) {
            if (print) {
                logWarn(`skipping non-typescript export '${name}'`);
            }
            continue;
        }

        if (!target.startsWith(SRC_PREFIX)) {
            return {
                err: `compiled export path must start with '${SRC_PREFIX}' (for entry point '${name}')`,
            };
        }
        const inSrcPath = target.substring(SRC_PREFIX.length);

        const sourcePathAbs = path.join(root, target);
        if (!fs.existsSync(sourcePathAbs)) {
            return {
                err: `couldn't find compiled export source ${target} (for entry point '${name}')`,
            };
        }
        if (print) {
            logInfo(`auto-configured entry "${name}": ${target}`);
        }
        const lastDotIndex = inSrcPath.lastIndexOf(".");
        if (lastDotIndex === -1) {
            logError(`unexpected: failed to get inSrcPath extension`);
            process.exit(1);
        }

        const distPath = inSrcPath.substring(0, lastDotIndex) + ".js";
        const distDtsPath = DTS + "/" + SRC + "/" + inSrcPath.substring(0, lastDotIndex) + ".d.ts";
        parsedExports.push({
            entryName: entryFileName,
            sourcePathAbs: sourcePathAbs,
            distPathRel: distPath,
            distDtsPathRel: distDtsPath,
        });
    }

    if (!parsedExports.length) {
        return {
            val: {
                exports: [],
            },
        };
    }

    return {
        val: {
            exports: parsedExports,
        },
    };
};
