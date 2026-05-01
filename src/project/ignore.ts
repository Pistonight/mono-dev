import fs from "node:fs";
import path from "node:path";

import type { PackageJson } from "#util";

export const getIgnoreConfig = (packageJson: PackageJson, rootDir: string): string[] => {
    let checkIgnoreLines: string[] = [];
    try {
        const gitignore = fs.readFileSync(path.join(rootDir, ".gitignore"), "utf-8");
        checkIgnoreLines = gitignore
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
    } catch {
        checkIgnoreLines = [];
    }
    const nocheck = packageJson["pistonight/mono-dev"]?.nocheck;
    if (nocheck) {
        checkIgnoreLines.push(...nocheck);
    }
    return checkIgnoreLines;
};
