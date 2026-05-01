import fs from "node:fs";
import { defineConfig as vitestDefineConfig } from "vitest/config";

import { getProjectPackageJsonPath, SRC, type PackageJson } from "#util";

import { genViteDefines, genVitePlugins } from "./gen_vite.ts";

export const configure = () => {
    const packageJsonPath = getProjectPackageJsonPath();
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    return vitestDefineConfig({
        plugins: genVitePlugins(packageJson),
        define: genViteDefines(packageJson),
        test: {
            passWithNoTests: true,
            // include in-source test with import.meta
            includeSource: [SRC + "/**/*.{ts,mts,cts,tsx}"],
        },
    });
};
