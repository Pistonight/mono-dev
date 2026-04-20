import path from "node:path";
import fs from "node:fs";
import { DTS, split_once } from "./util.js";

/**
 * @param {string} root_path
 * @param {import("./types.ts").PackageJson} package_json
 *
 * @return {[import("./types.ts").LibExport, undefined] | [undefined, string]}
 */
export const parse_exports = (root_path, package_json) => {
    if (!package_json.exports) {
        return [undefined, "no 'exports' in package.json"];
    }
    /** @type {Record<string, string | import("./types.ts").PackageExport>} */
    let exports;
    if (typeof package_json.exports === "string") {
        if (!package_json.types) {
            return [
                undefined,
                "'types' field must be specified in package.json when 'exports' is a string",
            ];
        }
        exports = {
            ".": {
                import: package_json.exports,
                types: package_json.types,
            },
        };
    } else {
        exports = package_json.exports;
        if (package_json.types) {
            return [
                undefined,
                "'types' field can only be specified in package.json when 'exports' is a string; use exports.<entry>.types",
            ];
        }
    }

    /** @type {string} */
    let dist = "";
    /** @type {string} */
    let src = "";
    /** @type {import("./types.ts").ParsedExport[]} */
    const parsed_exports = [];
    for (let name in exports) {
        let target = exports[name];
        if (typeof target === "string") {
            return [undefined, `exports value must be object with "import" and "types"`];
        }
        if (name.includes(" ")) {
            return [undefined, `entry name must not contain space: '${name}'`];
        }
        if (name === "index") {
            return [undefined, `entry name must not be "index", use "." instead`];
        }
        if (name === DTS) {
            return [undefined, `entry name must not be "${DTS}"`];
        }
        if (name !== ".") {
            if (!name.startsWith("./")) {
                return [undefined, "entry name subpath must start with './'"];
            }
            name = name.substring(2);
            if (name.includes("/")) {
                return [undefined, "entry name cannot contain '/' other than the initial './'"];
            }
            if (name.includes(".")) {
                return [undefined, "entry name cannot contain '.' other than the initial './'"];
            }
        }
        let import_path = target["import"];
        let type_path = target["types"];

        if (!import_path || !type_path) {
            return [undefined, `exports value must be object with "import" and "types"`];
        }

        if (!import_path.startsWith("./")) {
            return [undefined, `import path must start with './' (for entry point '${name}')`];
        }
        import_path = import_path.substring(2);
        if (dist) {
            if (!import_path.startsWith(`${dist}/`)) {
                return [
                    undefined,
                    `dist path must be the same for each entry point, the first is "${dist}"; found import path "${import_path}"`,
                ];
            }
            import_path = import_path.substring(dist.length + 1);
        } else {
            const [dist_part, rest] = split_once(import_path, "/");
            if (!rest) {
                return [undefined, `import path must be in the format of "./<dist>/<file>.js"`];
            }
            dist = dist_part.trim();
            import_path = rest;
        }
        if (!import_path.endsWith(".js")) {
            return [
                undefined,
                `import path must end with ".js": ${import_path} (for entry point '${name}')`,
            ];
        }
        import_path = import_path.substring(0, import_path.length - 3);

        if (!type_path.startsWith(`./${dist}/${DTS}/`)) {
            return [
                undefined,
                `types path must be in the format of "./${dist}/${DTS}/<src>/<file>.d.ts"`,
            ];
        }
        type_path = type_path.substring(dist.length + DTS.length + 4);
        if (src) {
            if (!type_path.startsWith(`${src}/`)) {
                return [
                    undefined,
                    `src path must be the same for each entry point, the first is "${src}"; found type path "${type_path}"`,
                ];
            }
            type_path = type_path.substring(src.length + 1);
        } else {
            const [src_part, rest] = split_once(type_path, "/");
            if (!rest) {
                return [
                    undefined,
                    `types path must be in the format of "./${dist}/${DTS}/<src>/<file>.d.ts"`,
                ];
            }
            src = src_part.trim();
            type_path = rest;
        }
        if (type_path !== `${import_path}.d.ts`) {
            return [
                undefined,
                `types path for "./${dist}/${import_path}.js" must be "./${dist}/${DTS}/${src}/${import_path}.d.ts", found "./${dist}/${DTS}/${src}/${type_path}"`,
            ];
        }

        let source_path = path.join(root_path, src, import_path + ".ts");
        let is_tsx = false;
        if (!fs.existsSync(source_path)) {
            source_path += "x";
            is_tsx = true;
            if (!fs.existsSync(source_path)) {
                return [
                    undefined,
                    `couldn't find source for export path ./dist/${import_path}.js, which should be ./${src}/${import_path}.ts{x}`,
                ];
            }
        }
        console.log(
            `[monolibbuild] configured entry "${name}": ${src}/${import_path}.ts${is_tsx ? "x" : ""}`,
        );
        parsed_exports.push({
            entry_name: name,
            source_path_abs: source_path,
            dist_path_rel: import_path + ".js",
        });
    }

    if (!parsed_exports.length) {
        return [undefined, "no exports configured."];
    }

    if (!dist) {
        return [undefined, 'dist directory cannot be ""'];
    }

    if (!src) {
        return [undefined, 'src directory cannot be ""'];
    }

    return [
        {
            dist,
            src,
            exports: parsed_exports,
        },
        undefined,
    ];
};
