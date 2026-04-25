import fs from "node:fs";
import path from "node:path";
import fs_promises from "node:fs/promises";

import { normalizeLineEnds, type PackageJson, type Result, stringifySortedIndent, type Void } from "#util";
import { parseExports } from "./exports.ts";

export const ensureSubpathImports = async (packageJson: PackageJson, jsonPath: string): Promise<Void<string>> => {
    const options = packageJson["pistonight/mono-dev"] || {};
    if ("importmap" in options) {
        if (options.importmap === false) {
            return {};
        }
    }
    if (!shouldCreateSubpathImports(packageJson)) {
        await write_subpath_import_mappings(undefined, packageJson, jsonPath);
    } else {
        const mappings = await createSubpathImports(path.dirname(path.resolve(jsonPath)), packageJson);
        if (mappings.err) {
            return mappings;
        }
        await write_subpath_import_mappings(mappings.val, packageJson, jsonPath);
    }
    return {};
}

const shouldCreateSubpathImports = (packageJson: PackageJson) => {
    const all_paths: string[] = [];
    const exports = packageJson.exports;
    if (!exports) {
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
const createSubpathImports = async (root: string, packageJson: PackageJson): Promise<Result<Record<string, string>, string>> => {
    const exports = parseExports(root, packageJson);
    if ("err" in exports) {
        return {err: `failed to create subpath imports: ${exports.err}`};
    }
    const {  src, } = exports.val;
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
                    const lastDot  = srcPath.lastIndexOf('.');
                    if (lastDot === -1) {
                        throw new Error("unexpected did not find path extension");
                    }
                    mappings[next.replace(/^src\//, "#")] = `./${srcPath}` ;
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

    return { val: mappings};
};

/**
 * Write the mappings to the import field of package.json
 *
 * @param {Record<string, string> | undefined} mappings the "imports" map to write
 * @param {Record<string, unknown>} packageJson current package.json object, will be modified
 * @param {string} jsonPath path of package.json
 */
const write_subpath_import_mappings = async ( mappings: Record<string, string> | undefined, packageJson: Record<string, unknown>, jsonPath: string): Promise<Void<string>> => {
    const new_imports = stringifySortedIndent(mappings, 4);
    if (packageJson.imports) {
        const current_imports = stringifySortedIndent(packageJson.imports, 4);
        if (current_imports === new_imports) {
            console.log("[mono] subpath import mapping is up-to-date");
            return {};
        }
    }
    const old_content = (await fs_promises.readFile(jsonPath, "utf-8")).trim();
    const current_lines = old_content.split("\n").map((x) => x.trimEnd());
    const start_line = current_lines.indexOf(`    "imports": {`);
    if (start_line === -1 && "imports" in packageJson) {
        return {err:"failed to edit 'imports' in package.json. Please delete the field manually and retry"};
    }
    if (start_line === -1) {
        if (mappings) {
            const old_content_without_closing = old_content.endsWith("}") ? old_content.substring(0, old_content.length-1) : old_content;
            const new_content = old_content_without_closing.trimEnd() + `,\n    "imports": ${new_imports}\n}`;
            await fs_promises.writeFile(jsonPath, normalizeLineEnds(new_content));
        }
    } else {
        let end_line = current_lines.indexOf(`    },`, start_line + 1);
        let trailing_comma = ",";
        if (end_line === -1) {
            end_line = current_lines.indexOf(`    }`, start_line + 1);
            trailing_comma = "";
            if (end_line === -1) {
                console.error("[mono] failed to edit 'imports' in package.json. Please delete the field manually and retry");
                process.exit(1);
            }
        }

        if (mappings) {
            current_lines.splice(start_line, end_line-start_line+1, `    "imports": ${new_imports}${trailing_comma}`);
        } else {
            current_lines.splice(start_line, end_line-start_line+1);
        }
        await fs_promises.writeFile(jsonPath, normalizeLineEnds(current_lines.join("\n")))
    }
    if (!mappings) {
        delete packageJson.imports;
    } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (packageJson as any).imports = mappings;
    }
    console.log("[mono] updated subpath import mapping");
    return { };
}
