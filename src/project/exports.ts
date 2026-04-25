import path from "node:path";
import fs from "node:fs";

import { DTS, type PackageJson, type Result, type LibExportConfig, splitOnce, type ParsedExport } from "#util";

export const parseExports =
(root: string, packageJson: PackageJson, print=false): Result<LibExportConfig, string> => {
    if (!packageJson.exports) {
        return {val:{ 
            dist: "dist",
            src: "src",
            exports: []
        }};
    }
    if (typeof packageJson.exports === "string") {
        return { err: "'exports' must be the object form in order for types to be respected" };
    } 
    if (packageJson.types) {
        return { err: "'types' field must not be specified in package.json; use exports.<entry>.types" };
    }
    const exports = packageJson.exports;

    let dist = "";
    let src = "";
    const parsedExports: ParsedExport[] = [];
    for (let name in exports) {
        const target = exports[name];
        if (typeof target === "string") {
            if (print) {
                console.warn(`[mono] skipping processing string export ${target}`)
            }
            continue;
        }
        if (name.includes(" ")) {
            return { err: `entry name must not contain space: '${name}'`};
        }
        if (name === "index") {
            return { err: `entry name must not be "index", use "." instead`};
        }
        if (name === DTS) {
            return {err: `entry name must not be "${DTS}"`};
        }
        if (name !== ".") {
            if (!name.startsWith("./")) {
                return { err: "entry name subpath must start with './'"};
            }
            name = name.substring(2);
            if (name.includes("/")) {
                return { err: "entry name cannot contain '/' other than the initial './'"};
            }
            if (name.includes(".")) {
                return { err: "entry name cannot contain '.' other than the initial './'"};
            }
        }
        let import_path = target["import"];
        let type_path = target["types"];

        if (!import_path || !type_path) {
            return { err: `exports value must be object with "import" and "types"`};
        }

        if (!import_path.startsWith("./")) {
            return { err: `import path must start with './' (for entry point '${name}')`};
        }
        import_path = import_path.substring(2);
        if (dist) {
            if (!import_path.startsWith(`${dist}/`)) {
                return { err:
                    `dist path must be the same for each entry point, the first is "${dist}"; found import path "${import_path}"`,
                };
            }
            import_path = import_path.substring(dist.length + 1);
        } else {
            const [dist_part, rest] = splitOnce(import_path, "/");
            if (!rest) {
                return { err: `import path must be in the format of "./<dist>/<file>.js"`};
            }
            dist = dist_part.trim();
            import_path = rest;
        }
        if (!import_path.endsWith(".js")) {
            return { err: `import path must end with ".js": ${import_path} (for entry point '${name}')`, };
        }
        import_path = import_path.substring(0, import_path.length - 3);

        if (!type_path.startsWith(`./${dist}/${DTS}/`)) {
            return { err: `types path must be in the format of "./${dist}/${DTS}/<src>/<file>.d.ts"`, };
        }
        type_path = type_path.substring(dist.length + DTS.length + 4);
        if (src) {
            if (!type_path.startsWith(`${src}/`)) {
                return { err: `src path must be the same for each entry point, the first is "${src}"; found type path "${type_path}"`, };
            }
            type_path = type_path.substring(src.length + 1);
        } else {
            const [src_part, rest] = splitOnce(type_path, "/");
            if (!rest) {
                return { err: `types path must be in the format of "./${dist}/${DTS}/<src>/<file>.d.ts"`, };
            }
            src = src_part.trim();
            type_path = rest;
        }
        if (type_path !== `${import_path}.d.ts`) {
            return { err: `types path for "./${dist}/${import_path}.js" must be "./${dist}/${DTS}/${src}/${import_path}.d.ts", found "./${dist}/${DTS}/${src}/${type_path}"`, };
        }

        let source_path = path.join(root, src, import_path + ".ts");
        let is_tsx = false;
        if (!fs.existsSync(source_path)) {
            source_path += "x";
            is_tsx = true;
            if (!fs.existsSync(source_path)) {
                return { err: `couldn't find source for export path ./dist/${import_path}.js, which should be ./${src}/${import_path}.ts{x}`, };
            }
        }
        if (print) {
            console.log(
                `[mono] configured entry "${name}": ${src}/${import_path}.ts${is_tsx ? "x" : ""}`,
            );
        }
        parsedExports.push({
            entry_name: name,
            source_path_abs: source_path,
            dist_path_rel: import_path + ".js",
        });
    }

    if (!parsedExports.length) {
        return {val:{ 
            dist: "dist",
            src: "src",
            exports: []
        }};
    }

    if (!dist) {
        return {err: 'dist directory cannot be ""'};
    }

    if (!src) {
        return {err: 'src directory cannot be ""'};
    }

    return {val:
        {
            dist,
            src,
            exports: parsedExports,
        },
    };
};
