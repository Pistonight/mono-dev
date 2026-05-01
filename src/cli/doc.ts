import path from "node:path";
import fs from "node:fs";

import { Application } from "typedoc";
import { load as typedocThemeOxidePlugin } from "typedoc-theme-oxide";

import { checkMonodevVersion, genPackageConfig, genTypeScriptConfig } from "#config";
import { getProjectLocations, logError, SRC, type PackageJson } from "#util";
import { parseExports } from "#project";

export const runDoc = async (args: string[]): Promise<number> => {
    const json = args.includes("--json");

    const { packageJsonPath, rootDir, cacheDir } = getProjectLocations();
    checkMonodevVersion(cacheDir);
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    const result = await genPackageConfig(packageJson, packageJsonPath);
    if ("err" in result) {
        logError("failed to config package: " + result.err);
        return 1;
    }
    const ts = await genTypeScriptConfig(packageJson);
    if (!ts.projectCount) {
        logError("no typescript directory, cannot generate doc");
        return 1;
    }

    const libExports = parseExports(rootDir, packageJson, true /* print */);
    if ("err" in libExports) {
        logError("failed to parse exports: " + libExports.err);
        return 1;
    }
    const { exports } = libExports.val;
    if (!exports.length) {
        logError("exports are empty, cannot generate doc");
        return 1;
    }

    const tsconfig_path = path.join(rootDir, `tsconfig.${SRC}.json`);
    const options = {
        // typedoc can parse .ts files in export directly
        entryPoints: exports.map(({ sourcePathAbs }) => sourcePathAbs),
        entryPointStrategy: "resolve" as const,
        out: path.join(rootDir, json ? "docs.json" : "docs"),
        theme: "oxide",
        plugin: [typedocThemeOxidePlugin],
        tsconfig: tsconfig_path,
        highlightLanguages: ["typescript", "css", "rust", "bash", "tsx"],
    };

    const app = await Application.bootstrapWithPlugins(options);

    const project = await app.convert();
    if (!project) {
        logError("failed to process project with typedoc");
        return 61;
    }
    if (json) {
        await app.generateJson(project, options.out);
    } else {
        await app.generateDocs(project, options.out);
    }
    return 0;
};
