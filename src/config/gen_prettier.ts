import fs from "node:fs";
import path from "node:path";

import { getIgnoreConfig } from "#project";
import { normalizeLineEnds, type PackageJson } from "#util";

export const genPrettierConfig = (packageJson: PackageJson, rootDir: string) => {
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
    const ignoreConfig = getIgnoreConfig(packageJson, rootDir);
    for (const line of ignoreConfig) {
        if (line.includes("tsconfig") || line.includes("eslint.config.js")) {
            continue;
        }
        ignore.push(line);
    }
    fs.writeFileSync(path.join(rootDir, ".prettierignore"), normalizeLineEnds(ignore.join("\n")));
};
