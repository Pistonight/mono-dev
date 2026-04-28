import fs from "node:fs";
import path from "node:path";
import fs_promises from "node:fs/promises";

import {
    normalizeLineEnds,
    type PackageJson,
    type Result,
    stringifySortedIndent,
    type Void,
    stringifySorted,
} from "#util";
import { parseExports } from "./exports.ts";

export const ensureSubpathImports = async (
    packageJson: PackageJson,
    jsonPath: string,
): Promise<Void<string>> => {
    const options = packageJson["pistonight/mono-dev"] || {};
    if ("importmap" in options) {
        if (options.importmap === false) {
            return {};
        }
    }
    if (!shouldCreateSubpathImports(packageJson)) {
        return await writeSubpathImports(undefined, packageJson, jsonPath);
    } else {
        const mappings = await createSubpathImports(
            path.dirname(path.resolve(jsonPath)),
            packageJson,
        );
        if (mappings.err) {
            return mappings;
        }
        return await writeSubpathImports(mappings.val, packageJson, jsonPath);
    }
    return {};
};

const shouldCreateSubpathImports = (packageJson: PackageJson) => {
    const all_paths: string[] = [];
    const exports = packageJson.exports;
    if (!exports) {
        // always create mappings for local/dev packages
        return true;
    }
    if (typeof exports === "string") {
        all_paths.push(exports);
    } else {
        for (const e of Object.values(exports)) {
            if (typeof e === "string") {
                all_paths.push(e);
            } else {
                if (e.types) {
                    all_paths.push(e.types);
                }
                if (e.import) {
                    all_paths.push(e.import);
                }
            }
        }
    }

    for (const p of all_paths) {
        if (!p) {
            continue;
        }
        if (p.endsWith(".d.ts")) {
            continue;
        }
        // if there are typescript exports, don't create mappings,
        // since the mapping could be exposed in the output
        if (
            p.endsWith(".ts") ||
            p.endsWith(".tsx") ||
            p.endsWith(".cts") ||
            p.endsWith(".mts") ||
            p.endsWith(".ctsx") ||
            p.endsWith(".mtsx")
        ) {
            return false;
        }
    }
    return true;
};

/** Create import mapping from `#` */
const createSubpathImports = async (
    root: string,
    packageJson: PackageJson,
): Promise<Result<Record<string, string>, string>> => {
    const exports = parseExports(root, packageJson);
    if ("err" in exports) {
        return { err: `failed to create subpath imports: ${exports.err}` };
    }
    const { src } = exports.val;
    const rest: string[] = [];
    try {
        const top = await fs_promises.readdir(`./${src}`);
        for (const p of top) {
            const srcPath = `${src}/${p}`;
            if (fs.statSync(srcPath).isDirectory()) {
                rest.push(srcPath.replace(/\/+$/, ""));
            }
        }
    } catch {
        // ignore
    }

    const mappings: Record<string, string> = {};

    while (rest.length) {
        const next = rest.pop();
        if (!next) {
            break;
        }
        try {
            const files = await fs_promises.readdir(next);
            let dirs = [];
            for (const f of files) {
                const srcPath = `${next}/${f}`;
                if (f.match(/index\.(c|m)?tsx?$/)) {
                    const lastDot = srcPath.lastIndexOf(".");
                    if (lastDot === -1) {
                        throw new Error("unexpected did not find path extension");
                    }
                    mappings[next.replace(/^src\//, "#")] = `./${srcPath}`;
                    dirs = [];
                    break;
                }
                if (fs.statSync(srcPath).isDirectory()) {
                    dirs.push(srcPath.replace(/\/+$/, ""));
                }
            }
            rest.push(...dirs);
        } catch {
            // ignore
        }
    }

    return { val: mappings };
};

/**
 * Write the mappings to the import field of package.json
 *
 * @param {Record<string, string> | undefined} mappings the "imports" map to write
 * @param {Record<string, unknown>} packageJson current package.json object, will be modified
 * @param {string} jsonPath path of package.json
 */
const writeSubpathImports = async (
    mappings: Record<string, string> | undefined,
    packageJson: PackageJson,
    jsonPath: string,
): Promise<Void<string>> => {
    const newImports = stringifySortedIndent(mappings, 4);
    if (packageJson.imports) {
        const currentImports = stringifySortedIndent(packageJson.imports, 4);
        if (currentImports === newImports) {
            console.log("[mono] subpath import mapping is up-to-date");
            return {};
        }
    }
    const oldContent = (await fs_promises.readFile(jsonPath, "utf-8")).trim();
    const currentLines = oldContent.split("\n").map((x) => x.trimEnd());

    let startLine: number;
    let endLine: number;
    let isLastField: boolean;

    startLine = currentLines.indexOf(`    "imports": {`);
    if (startLine !== -1) {
        endLine = currentLines.indexOf(`    },`, startLine + 1);
        if (endLine === -1) {
            endLine = currentLines.indexOf(`    }`, startLine + 1);
            if (endLine === -1) {
                return {
                    err: "failed to edit 'imports' in package.json: cannot find end of 'imports' field. Please delete the field manually and retry",
                };
            }
            isLastField = true;
        } else {
            isLastField = false;
        }
    } else {
        startLine = currentLines.indexOf(`    "imports": {}`);
        if (startLine !== -1) {
            endLine = startLine;
            isLastField = true;
        } else {
            startLine = currentLines.indexOf(`    "imports": {},`);
            if (startLine !== -1) {
                endLine = startLine;
                isLastField = false;
            } else {
                // else: imports field not in old content
                startLine = endLine = -1;
                isLastField = false;
            }
        }
    }

    if (startLine === -1 && "imports" in packageJson) {
        return {
            err: "failed to edit 'imports' in package.json: cannot locate 'imports' field. Please delete the field manually and retry",
        };
    }

    let newContent: string;

    if (startLine !== -1) {
        const trailingComma = isLastField ? "" : ",";

        if (mappings) {
            currentLines.splice(
                startLine,
                endLine - startLine + 1,
                `    "imports": ${newImports}${trailingComma}`,
            );
        } else {
            currentLines.splice(startLine, endLine - startLine + 1);
        }
        newContent = normalizeLineEnds(currentLines.join("\n"));
    } else {
        if (mappings) {
            const oldContentWithoutClosing = oldContent.endsWith("}")
                ? oldContent.substring(0, oldContent.length - 1)
                : oldContent;
            newContent = normalizeLineEnds(
                oldContentWithoutClosing.trimEnd() + `,\n    "imports": ${newImports}\n}`,
            );
        } else {
            console.log("[mono] subpath import mapping is up-to-date");
            return {};
        }
    }
    const packageJsonCopy = { ...packageJson };
    if (!mappings) {
        delete packageJsonCopy.imports;
    } else {
        packageJsonCopy.imports = mappings;
    }
    const expectedContent = normalizeLineEnds(stringifySorted(packageJsonCopy) || "");
    try {
        const actualContent = normalizeLineEnds(stringifySorted(JSON.parse(newContent)) || "");
        if (expectedContent !== actualContent) {
            console.log({ expectedContent, actualContent });
            return {
                err: "failed to edit 'imports' in package.json: failed to edit 'imports'. Please delete the field manually and retry",
            };
        }
    } catch {
        return {
            err: "failed to edit 'imports' in package.json: failed to edit 'imports': content is not valid JSON after editing. Please delete the field manually and retry",
        };
    }

    await fs_promises.writeFile(jsonPath, newContent);
    if (!mappings) {
        delete packageJson.imports;
    } else {
        packageJson.imports = mappings;
    }
    console.log("[mono] updated subpath import mapping");
    return {};
};
