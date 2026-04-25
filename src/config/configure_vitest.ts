import fs from "node:fs";
import path from "node:path";
import { defineConfig as vitestDefineConfig } from "vitest/config";

import { getProjectPackageJsonPath, type PackageJson } from "#util";
import { parseExports } from "#project";

import { genViteDefines, genVitePlugins } from "./gen_vite.ts";

export const configure = () => {
    const packageJsonPath = getProjectPackageJsonPath();
    const rootDir = path.dirname(packageJsonPath);
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const libExports = parseExports(rootDir, packageJson);
    let src = "src";
    if (libExports.val) {
        src = libExports.val.src;
    }
    return vitestDefineConfig({
        plugins: genVitePlugins(packageJson),
        define: genViteDefines(packageJson),
        test: {
            passWithNoTests: true,
            // include in-source test with import.meta
            includeSource: [src + "/**/*.{ts,mts,cts,tsx}"],
        },
    });
};
