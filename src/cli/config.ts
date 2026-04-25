import fs from "node:fs";

import {
    checkMonodevVersion,
    genEslintConfig,
    genPackageConfig,
    genTypeScriptConfig,
} from "#config";
import { getProjectLocations, type PackageJson } from "#util";

export const runConfig = async (_args: string[]): Promise<number> => {
    const { packageJsonPath, rootDir, cacheDir } = getProjectLocations();
    checkMonodevVersion(cacheDir);
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    const result = await genPackageConfig(packageJson, packageJsonPath);
    if ("err" in result) {
        console.error(`[mono] failed to config package: ` + result.err);
        return 1;
    }
    const ts = await genTypeScriptConfig(packageJson);

    if (ts.projectCount) {
        genEslintConfig(rootDir);
    } else {
        console.log("[mono] not generating eslint config because no typescript directories exist");
    }

    console.log("[mono] config generated");
    return 0;
};
