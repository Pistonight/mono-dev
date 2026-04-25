import path from "node:path";
import fs from "node:fs";

import { Application } from "typedoc";
import { load as typedocThemeOxidePlugin } from "typedoc-theme-oxide";

import { checkMonodevVersion, genPackageConfig, genTypeScriptConfig } from "#config";
import { getProjectLocations, type PackageJson, } from "#util";
import { parseExports } from "#project";

export const runDoc = async (args: string[]): Promise<number> => {
    const json = args.includes("--json");

    const { packageJsonPath, rootDir, cacheDir } = getProjectLocations();
    checkMonodevVersion(cacheDir);
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    const libExports = parseExports(rootDir, packageJson, true /* print */);
    if ("err" in libExports) {
        console.error(`[mono] failed to parse exports: ` + libExports.err);
        return 1;
    }
    const { src, exports } = libExports.val;
    if (!exports.length) {
        console.error("[mono] exports are empty, cannot generate doc");
        return 1;
    }

    await genPackageConfig(packageJson, packageJsonPath);
    const ts = await genTypeScriptConfig(packageJson);
    if (!ts.projectCount)  {
        console.error("[mono] no typescript directory, cannot generate doc");
        return 1;
    }

    const tsconfig_path = path.join(rootDir, `tsconfig.${src}.json`);
    const options = {
        entryPoints: exports.map(({ source_path_abs }) => source_path_abs),
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
        console.error("[mono] failed to process project with typedoc");
        return 61;
    }
    if (json) {
        await app.generateJson(project, (options.out));
    } else {
        await app.generateDocs(project, (options.out));
    }
    return 0;
}
